"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { ChoiceField } from "./ChoiceField";
import { HoverWord } from "./HoverWord";
import { useSupply } from "./Supply";
import type { Item } from "../lib/catalog";

function MaterialRow({ item, quantity }: { item: Item; quantity: number }) {
  const { setQty } = useSupply();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (input.current && input.current.valueAsNumber !== quantity)
      input.current.value = String(quantity);
  }, [quantity]);
  return (
    <div className="basket-row">
      <strong>{item.name}</strong>
      <div className="item-quantity">
        <input
          type="number"
          name={"qty-" + item.id}
          ref={input}
          defaultValue={quantity}
          min=".001"
          max="9999999"
          step=".001"
          required
          aria-describedby="quantity-error"
          aria-label={"Количество: " + item.name}
          onChange={(e) => {
            if (e.target.validity.valid)
              setQty(item.id, e.target.valueAsNumber);
          }}
        />
        <span>{item.unit}</span>
      </div>
      <button
        type="button"
        className="remove-item"
        aria-label={"Удалить " + item.name}
        onClick={() => setQty(item.id, 0)}
      >
        ×
      </button>
    </div>
  );
}

type Props = {
  staticMode: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  feedback: string;
};

const messages: Record<string, string> = {
  name: "Укажите имя.",
  contact: "Укажите телефон или электронную почту.",
  consent: "Для отправки нужно ваше согласие.",
};

export default function RequestFields({
  staticMode,
  onSubmit,
  busy,
  feedback,
}: Props) {
  const { products, basket, setQty } = useSupply();
  const selected = products.filter((item) => basket[item.id]);
  const [portal, setPortal] = useState<HTMLDialogElement | null>(null);
  const mount = useCallback(
    (form: HTMLFormElement | null) =>
      setPortal(form?.closest("dialog") ?? null),
    [],
  );
  const [attempted, setAttempted] = useState(false);
  const [fileName, setFileName] = useState("");
  function validate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    const invalid =
      event.currentTarget.querySelector<HTMLInputElement>(":invalid");
    if (invalid) {
      invalid.closest("details")?.setAttribute("open", "");
      invalid.focus();
      return;
    }
    onSubmit(event);
  }

  return (
    <form
      className="request-form"
      ref={mount}
      onSubmit={validate}
      noValidate
      data-attempted={attempted || undefined}
      aria-busy={busy}
    >
      <div className="request-columns">
        <section
          className="request-materials"
          aria-labelledby="materials-title"
        >
          <h3 id="materials-title">Материалы</h3>
          <ChoiceField
            label="Добавить материал"
            value=""
            placeholder="Выберите позицию"
            portalContainer={portal}
            options={products.map((p) => ({ value: p.id, label: p.name }))}
            onChange={(id) => setQty(id, (basket[id] || 0) + 1)}
          />
          {selected.length > 0 && (
            <div className="request-list">
              {selected.map((item) => (
                <MaterialRow
                  key={item.id}
                  item={item}
                  quantity={basket[item.id]}
                />
              ))}
              <p className="quantity-error" id="quantity-error">
                Введите количество от 0,001 до 9 999 999 с точностью до
                тысячных.
              </p>
            </div>
          )}
          <label>
            Комментарий к поставке
            <textarea
              name="note"
              rows={2}
              maxLength={2900}
              placeholder="Материалы, объёмы или пожелания"
            />
          </label>
          {!staticMode && (
            <label>
              Спецификация до 8 МБ
              <span className="file-field">
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.xls,.xlsx"
                  aria-label="Спецификация до 8 МБ"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                />
                <span aria-hidden="true">Выбрать файл</span>
                <span aria-hidden="true">{fileName || "PDF, XLS, XLSX"}</span>
              </span>
            </label>
          )}
        </section>
        <section className="request-contact" aria-labelledby="contact-title">
          <h3 id="contact-title">Ваши контакты</h3>
          <label>
            Имя
            <input
              name="name"
              autoComplete="given-name"
              maxLength={120}
              required
              aria-describedby="name-error"
            />
            <small className="field-error" id="name-error">
              {messages.name}
            </small>
          </label>
          <label>
            Телефон или почта
            <input
              name="contact"
              maxLength={180}
              required
              aria-describedby="contact-error"
            />
            <small className="field-error" id="contact-error">
              {messages.contact}
            </small>
          </label>
          <details className="request-details">
            <summary>Данные об объекте</summary>
            <div>
              <label>
                Компания
                <input
                  name="company"
                  autoComplete="organization"
                  maxLength={200}
                />
              </label>
              <label>
                Адрес объекта
                <input name="address" maxLength={250} />
              </label>
              <label>
                Желаемый срок
                <input type="date" name="when" />
              </label>
            </div>
          </details>
        </section>
      </div>
      <div className="request-submit">
        <div>
          <label className="check">
            <input
              type="checkbox"
              name="consent"
              value="yes"
              required
              aria-describedby="consent-error"
            />
            <span>
              Согласен на обработку данных для расчёта и обратной связи.
            </span>
          </label>
          <small className="field-error" id="consent-error">
            {messages.consent}
          </small>
          {staticMode && (
            <p className="request-help">
              Скачайте заявку и отправьте её на{" "}
              <a href="mailto:1751416@internet.ru">1751416@internet.ru</a>.
            </p>
          )}
          {feedback && (
            <p className="submit-feedback" role="alert">
              {feedback}
            </p>
          )}
        </div>
        <button className="btn request-action" disabled={busy}>
          <HoverWord>
            {busy
              ? "Подготовка…"
              : staticMode
                ? "Скачать заявку"
                : "Отправить заявку"}
          </HoverWord>
        </button>
      </div>
    </form>
  );
}
