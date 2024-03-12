import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { Ref, createRef, ref } from "lit/directives/ref.js";

import BaseElement, { registerEventHandler } from "@shared/element";
import { svgIcons } from "@shared/icons";
import { ToastEvent } from "@/shared/events";

type ToastSeverity = "info" | "warning" | "error";

@customElement("toast-manager")
export class ToastManager extends BaseElement {
  @state()
  private accessor alerts: ReturnType<typeof html>[] = [];

  private accessor alertRefs: Ref<HTMLDivElement>[] = [];

  #removeAlert(alertRef: Ref<HTMLDivElement>) {
    const index = this.alertRefs.indexOf(alertRef);
    this.alerts = this.alerts.filter((_, i) => i !== index);
    this.alertRefs = this.alertRefs.filter((_, i) => i !== index);
  }

  @registerEventHandler(ToastEvent)
  handleToastManager(
    severity: ToastSeverity,
    message: string | ReturnType<typeof html>,
  ) {
    this.toast(severity, message);
  }

  toast(severity: ToastSeverity, message: string | ReturnType<typeof html>) {
    const alertIcon =
      severity === "info" ? svgIcons.info
      : severity === "warning" ? svgIcons.warning
      : svgIcons.sad;
    const alertClass = classMap({
      "alert-info": severity === "info",
      "alert-warning": severity === "warning",
      "alert-error": severity === "error",
    });
    const alertRef = createRef<HTMLDivElement>();
    const alert = html`
      <div
        class="${alertClass} alert gap-0 drop-shadow"
        role="alert"
        ${ref(alertRef)}
      >
        <span class="flex items-center gap-4">
          <span class="size-6 sm:size-8">${alertIcon}</span>
          <span class="w-44 text-wrap text-left text-sm sm:w-64 sm:text-base">
            ${message}
          </span>
          <button
            class="btn btn-circle btn-ghost btn-sm"
            @click=${() => this.#removeAlert(alertRef)}
          >
            <span class="size-6">${svgIcons.close}</span>
          </button>
        </span>
      </div>
    `;
    this.alerts = [...this.alerts, alert];
    this.alertRefs = [...this.alertRefs, alertRef];
  }

  protected render() {
    return html`<div class="toast">${this.alerts}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "toast-manager": ToastManager;
  }
}
