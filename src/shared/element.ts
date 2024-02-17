/* eslint-disable max-classes-per-file */

import { LitElement } from "lit";

import EventBus, { EventCallback } from "@shared/eventbus";

type TLitElement = new (...args: any[]) => LitElement;

function EventBusMixIn<TBase extends TLitElement>(Base: TBase) {
  return class EventBusLitElement extends Base {
    subscribedTopics?: { [topic: string]: EventCallback };

    connectedCallback() {
      super.connectedCallback();
      if (this.subscribedTopics != null)
        Object.entries(this.subscribedTopics).forEach(([topic, callback]) =>
          EventBus.subscribe(this, topic, callback),
        );
    }

    publish(topic: string, ...eventData: any[]) {
      EventBus.publish(topic, ...eventData);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this.subscribedTopics != null)
        Object.keys(this.subscribedTopics).forEach((topic) =>
          EventBus.unsubscribe(this, topic),
        );
    }
  };
}

function LightDomMixIn<TBase extends TLitElement>(Base: TBase) {
  return class LightDomLitElement extends Base {
    createRenderRoot() {
      /* Disable Shadow DOM. Styles are handled by Tailwind. */
      return this;
    }
  };
}

function registerEventHandler<This, Args extends any[], Return>(topic: string) {
  return function registerEventHandlerDecorator(
    _: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext,
  ) {
    if (topic == null || topic === "") return;

    const { name } = context;

    /*
     * NOTE: A TC39 stage 3 decorator initializer function isn't really
     * invoked with any parameters, but pretending it is keeps TypeScript
     * happy. `this` within the function is actually runtime-bound to an
     * instance of the class to which the method being decorated belongs.
     */

    context.addInitializer(function bindAndRegister(this: any) {
      this[name] = this[name].bind(this);
      if (!Object.hasOwn(this, "subscribedTopics")) this.subscribedTopics = {};
      this.subscribedTopics[topic] = this[name];
    });
  };
}

const BaseElement = EventBusMixIn(LightDomMixIn(LitElement));

const stringArrayConverter = {
  fromAttribute: (value: string | null) =>
    value?.split(/\s+/).filter((x) => x !== "") ?? [],
  toAttribute: (value: string[]) => value.join(" "),
} as const;

export default BaseElement;
export {
  EventBusMixIn,
  LightDomMixIn,
  registerEventHandler,
  stringArrayConverter,
};
