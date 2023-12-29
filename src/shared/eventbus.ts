export type EventCallback = (...eventData: any[]) => any;

class EventBus {
  static #instance: EventBus;

  #eventMap = new Map<string, Map<object, EventCallback>>();

  constructor() {
    if (EventBus.#instance != null)
      throw new Error("EventBus is a singleton class.");
    EventBus.#instance = this;
  }

  subscribe(subscriber: object, topic: string, callback: EventCallback) {
    if (!this.#eventMap.has(topic))
      this.#eventMap.set(topic, new Map<object, EventCallback>());
    if (this.#eventMap.get(topic)!.has(subscriber))
      throw new Error(`Subscriber is already subscribed to "${topic}".`);
    this.#eventMap.get(topic)!.set(subscriber, callback);
  }

  unsubscribe(subscriber: object, topic: string) {
    this.#eventMap.get(topic)?.delete(subscriber);
    if (this.#eventMap.get(topic)?.size === 0) this.#eventMap.delete(topic);
  }

  publish(topic: string, ...eventData: any[]) {
    this.#eventMap.get(topic)?.forEach((callback) => callback(...eventData));
  }

  clear() {
    this.#eventMap.clear();
  }
}

export default new EventBus();
