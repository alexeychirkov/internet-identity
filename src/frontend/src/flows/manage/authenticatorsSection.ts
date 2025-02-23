import { warningIcon } from "$src/components/icons";
import { isNullish, nonNullish } from "@dfinity/utils";
import { html, TemplateResult } from "lit-html";
import { settingsDropdown } from "./settingsDropdown";
import { Authenticator } from "./types";

// The maximum number of authenticator (non-recovery) devices we allow.
// The canister limits the _total_ number of devices (recovery included) to 10,
// and we (the frontend) only allow user one recovery device per type (phrase, fob),
// which leaves room for 8 authenticator devices.
const MAX_AUTHENTICATORS = 8;

// A device with extra information about whether another device (earlier in the list)
// has the same name.
export type DedupAuthenticator = Authenticator & { dupCount?: number };

// Deduplicate devices with same (duplicated) aliases
const dedupLabels = (authenticators: Authenticator[]): DedupAuthenticator[] => {
  return authenticators.reduce<Authenticator[]>((acc, authenticator) => {
    const _authenticator: DedupAuthenticator = { ...authenticator };
    const sameName = acc.filter((a) => a.alias === _authenticator.alias);
    if (sameName.length >= 1) {
      _authenticator.dupCount = sameName.length + 1;
    }

    acc.push(_authenticator);
    return acc;
  }, []);
};

export const authenticatorsSection = ({
  authenticators: authenticators_,
  onAddDevice,
  warnFewDevices,
}: {
  authenticators: Authenticator[];
  onAddDevice: () => void;
  warnFewDevices: boolean;
}): TemplateResult => {
  const wrapClasses = ["l-stack"];

  if (warnFewDevices) {
    wrapClasses.push("c-card", "c-card--narrow", "c-card--warning");
  }

  const authenticators = dedupLabels(authenticators_);

  return html`
    <aside class=${wrapClasses.join(" ")}>
      ${
        warnFewDevices
          ? html`<span class="c-card__icon" aria-hidden="true"
              >${warningIcon}</span
            >`
          : undefined
      }
      <div class=${warnFewDevices ? "c-card__content" : undefined}>
        <div class="t-title t-title--complications">
          <h2 class="t-title">Passkeys</h2>
          <span class="t-title__complication c-tooltip" tabindex="0">
            <span class="c-tooltip__message c-card c-card--tight">
              You can register up to ${MAX_AUTHENTICATORS} passkeys
              (recovery devices excluded)</span>
              (${authenticators.length}/${MAX_AUTHENTICATORS})
            </span>
          </span>
        </div>
        ${
          warnFewDevices
            ? html`<p
                style="max-width: 30rem;"
                class="warning-message t-paragraph t-lead"
              >
                Add a Passkey or recovery method to make your Internet Identity
                more secure.
              </p>`
            : undefined
        }

        <div class="c-action-list">
          <ul>
          ${authenticators.map((authenticator, index) =>
            authenticatorItem({ authenticator, index })
          )}</ul>
          <div class="c-action-list__actions">
            <button
              ?disabled=${authenticators.length >= MAX_AUTHENTICATORS}
              class="c-button c-button--primary c-tooltip c-tooltip--onDisabled c-tooltip--left"
              @click="${() => onAddDevice()}"
              id="addAdditionalDevice"
            >
              <span class="c-tooltip__message c-card c-card--tight"
                >You can register up to ${MAX_AUTHENTICATORS} authenticator devices.
                Remove a device before you can add a new one.</span
              >
              <span>Add new Passkey</span>
            </button>
          </div>

        </div>
      </div>
    </aside>`;
};

export const authenticatorItem = ({
  authenticator: { alias, dupCount, warn, remove, rename },
  index,
}: {
  authenticator: DedupAuthenticator;
  index: number;
}) => {
  const settings = [
    { action: "rename", caption: "Rename", fn: () => rename() },
  ];

  if (nonNullish(remove)) {
    settings.push({ action: "remove", caption: "Remove", fn: () => remove() });
  }

  return html`
    <li class="c-action-list__item" data-device=${alias}>
      ${isNullish(warn) ? undefined : itemWarning({ warn })}
      <div class="c-action-list__label">
        ${alias}
        ${nonNullish(dupCount) && dupCount > 0
          ? html`<i class="t-muted">&nbsp;(${dupCount})</i>`
          : undefined}
      </div>
      ${settingsDropdown({
        alias,
        id: `authenticator-${index}`,
        settings,
      })}
    </li>
  `;
};

const itemWarning = ({
  warn,
}: {
  warn: TemplateResult;
}): TemplateResult => html`<div class="c-action-list__action">
  <span class="c-tooltip c-icon c-icon--error" tabindex="0"
    >${warningIcon}<span class="c-tooltip__message c-card c-card--tight"
      >${warn}</span
    ></span
  >
</div>`;
