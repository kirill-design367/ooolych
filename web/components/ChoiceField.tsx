"use client";
import * as Select from "@radix-ui/react-select";
import { useId } from "react";

type Option = { value: string; label: string };
export function ChoiceField({
  label,
  value,
  options,
  onChange,
  portalContainer,
  placeholder = "Выберите материал",
}: {
  portalContainer?: HTMLElement | null;
  placeholder?: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  // Radix reserves the empty value for an unselected control.
  const all = "__all__";
  return (
    <div className="choice-field">
      <label htmlFor={id}>{label}</label>
      <Select.Root
        value={value || all}
        onValueChange={(v) => onChange(v === all ? "" : v)}
      >
        <Select.Trigger className="choice-trigger" id={id}>
          <Select.Value>
            {options.find((o) => o.value === value)?.label || placeholder}
          </Select.Value>
          <Select.Icon aria-hidden="true">
            <svg
              viewBox="0 0 16 16"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="m4 6 4 4 4-4" />
            </svg>
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal container={portalContainer}>
          <Select.Content
            position="popper"
            sideOffset={6}
            collisionPadding={12}
            className="choice-menu"
            data-lenis-prevent
          >
            <Select.Viewport>
              {options.map((o) => (
                <Select.Item
                  key={o.value}
                  value={o.value || all}
                  className="choice-item"
                >
                  <Select.ItemText>{o.label}</Select.ItemText>
                  <Select.ItemIndicator aria-hidden="true">
                    ✓
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
