"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { items, categories, type Item } from "../lib/catalog";

const staticMode =
  process.env.NEXT_PUBLIC_STATIC === "1" ||
  process.env.NODE_ENV === "development";
type Category = (typeof categories)[number];
type Supply = {
  products: Item[];
  sections: Category[];
  basket: Record<string, number>;
  setQty: (id: string, n: number) => void;
  request: () => void;
  travel: (id: string, back?: boolean) => void;
};
const Context = createContext<Supply | null>(null);
export const useSupply = () => useContext(Context)!;
export function Brand() {
  return <span className="brand">Луч</span>;
}
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={"arrow" + (diagonal ? " diagonal" : "")}
    />
  );
}
export function SupplyRoot({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState(items),
    [sections, setSections] = useState(categories),
    [basket, setBasket] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState(""),
    [busy, setBusy] = useState(false),
    [complete, setComplete] = useState(false);
  const [menu, setMenu] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    auth = useRef({ csrf: "", key: "" }),
    router = useRouter(),
    path = usePathname(),
    focus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (staticMode) return;
    fetch("/supply.php", { cache: "no-store" })
      .then((r) => r.json())
      .then(({ catalog, csrf, key }) => {
        auth.current = { csrf, key };
        const mapped = Object.entries(
          catalog.items as Record<
            string,
            {
              name: string;
              category: string;
              unit: string;
              price: string;
              specs: string;
              description: string;
            }
          >,
        ).map(([id, p]) => ({
          ...p,
          id,
          rate:
            p.price !== ""
              ? Number(p.price)
              : (items.find((x) => x.id === id)?.rate ?? 0),
          spec:
            p.specs || items.find((x) => x.id === id)?.spec || p.description,
        }));
        setProducts(mapped);
        setSections(
          Object.entries(
            catalog.categories as Record<
              string,
              { name: string; description: string }
            >,
          ).map(([id, c]) => ({ id, name: c.name, detail: c.description })),
        );
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    setMenu(false);
  }, [path]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let stop = () => {},
      cancelled = false;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const smooth = new Lenis({
        autoRaf: true,
        anchors: true,
        prevent: (el) => !!el.closest("dialog"),
      });
      stop = () => smooth.destroy();
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, []);
  useEffect(() => {
    if (new URLSearchParams(location.search).has("request")) request();
  }, []);
  function setQty(id: string, n: number) {
    setBasket((old) => {
      const next = { ...old };
      if (n > 0) next[id] = n;
      else delete next[id];
      return next;
    });
  }
  function request() {
    focus.current = document.activeElement as HTMLElement;
    setComplete(false);
    setFeedback("");
    dialog.current?.showModal();
  }
  async function travel(id: string, back = false) {
    const dest = back ? "/" : "/catalog/?c=" + encodeURIComponent(id);
    const source = document.getElementById(
      back ? "catalog-title" : "cat-" + id,
    );
    if (!source || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(dest);
      return;
    }
    const [{ gsap }, { Flip }] = await Promise.all([
      import("gsap"),
      import("gsap/Flip"),
    ]);
    gsap.registerPlugin(Flip);
    const panel = document.createElement("div");
    panel.className = "travel";
    panel.textContent = source.textContent?.split("↗")[0] || "Каталог";
    panel.setAttribute("aria-hidden", "true");
    const r = source.getBoundingClientRect();
    Object.assign(panel.style, {
      left: r.left + "px",
      top: r.top + "px",
      width: r.width + "px",
      height: r.height + "px",
    });
    document.body.append(panel);
    const state = Flip.getState(panel);
    Object.assign(panel.style, {
      left: "0",
      top: "0",
      width: "100vw",
      height: "100dvh",
    });
    Flip.from(state, {
      duration: 0.38,
      ease: "power2.inOut",
      onComplete: () => {
        router.push(dest, { scroll: false });
        let attempts = 0;
        function settle() {
          const target = document.getElementById(
            back ? "cat-" + id : "catalog-title",
          );
          if (!target && attempts++ < 90) {
            requestAnimationFrame(settle);
            return;
          }
          if (back)
            target?.scrollIntoView({ block: "center", behavior: "instant" });
          else window.scrollTo({ top: 0, behavior: "instant" });
          if (!target) {
            panel.remove();
            return;
          }
          const box = target.getBoundingClientRect();
          gsap.to(panel, {
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            opacity: 0,
            duration: 0.36,
            onComplete: () => panel.remove(),
          });
        }
        requestAnimationFrame(settle);
      },
    });
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      fd = new FormData(form);
    const note = [
      fd.get("address") && "Объект: " + fd.get("address"),
      fd.get("when") && "Срок: " + fd.get("when"),
      fd.get("note"),
    ]
      .filter(Boolean)
      .join("\n");
    if (
      !Object.keys(basket).length &&
      !note &&
      !(fd.get("file") as File)?.size
    ) {
      setFeedback("Добавьте материал, комментарий или спецификацию.");
      return;
    }
    setBusy(true);
    setFeedback("");
    try {
      if (staticMode) {
        const content = [
          "Заявка на расчёт ООО «Луч»",
          ...["name", "contact", "company"].map((k) => fd.get(k)),
          ...products
            .filter((p) => basket[p.id])
            .map((p) => p.name + " — " + basket[p.id] + " " + p.unit),
          note,
        ]
          .filter(Boolean)
          .join("\n");
        const url = URL.createObjectURL(
          new Blob([content], { type: "text/plain;charset=utf-8" }),
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = "Заявка-Луч.txt";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setFeedback(
          "Файл заявки подготовлен. Отправьте его на 1751416@internet.ru.",
        );
      } else {
        if (!auth.current.key)
          auth.current = await (
            await fetch("/supply.php", { cache: "no-store" })
          ).json();
        fd.set("basket", JSON.stringify(basket));
        fd.set("note", note);
        fd.set("csrf", auth.current.csrf);
        fd.set("key", auth.current.key);
        const res = await fetch("/supply.php", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw Error(data.error || "Не удалось сохранить заявку.");
        auth.current.key = "";
        setFeedback("Заявка № " + data.id + " получена.");
        setBasket({});
        form.reset();
      }
      setComplete(true);
    } catch (err) {
      setFeedback(
        err instanceof Error && !/JSON|fetch|Unexpected/i.test(err.message)
          ? err.message
          : "Сервис временно недоступен. Повторите попытку или позвоните нам.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Context.Provider
      value={{ products, sections, basket, setQty, request, travel }}
    >
      <a className="skip" href="#main">
        К содержанию
      </a>
      <header>
        <div className="shell header-row">
          <Link href="/" aria-label="Луч — главная">
            <Brand />
          </Link>
          <nav
            className={menu ? "open" : ""}
            aria-label="Главное меню"
            onClick={() => setMenu(false)}
          >
            <Link href="/catalog/">Каталог</Link>
            <Link href="/#estimate">Калькулятор</Link>
            <Link href="/#supply">Поставки</Link>
            <Link href="/#contacts">Контакты</Link>
          </nav>
          <a className="tel" href="tel:+79201751446">
            +7 (920) 175-14-46
          </a>
          <button className="btn dark small" onClick={request}>
            Заявка {Object.keys(basket).length || ""} <Arrow diagonal />
          </button>
          <button
            className="burger"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-label="Меню"
          >
            ☰
          </button>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer id="contacts">
        <div className="shell">
          <Brand />
          <div>
            <h2>Свяжитесь с нами</h2>
            <a href="tel:+79201751446">+7 (920) 175-14-46</a>
            <a href="mailto:1751416@internet.ru">1751416@internet.ru</a>
          </div>
          <address>
            Московская область, г. Подольск
            <br />
            тер. СНТ № 4 ПЭМЗ Красная Горка,
            <br />
            д. 4, стр. 1, ком. 4
          </address>
        </div>
        <div className="shell footline">
          <span>ООО «Луч» · ИНН 5074081719 · ОГРН 1235000061548</span>
          <Link href="/fonts/">Типографика</Link>
        </div>
      </footer>
      <dialog
        ref={dialog}
        aria-labelledby="request-title"
        data-lenis-prevent
        onClose={() => focus.current?.focus()}
      >
        <div className="dialog-head">
          <h2 id="request-title">Заявка на расчёт</h2>
          <button aria-label="Закрыть" onClick={() => dialog.current?.close()}>
            ×
          </button>
        </div>
        {complete ? (
          <div role="status">
            <p>{feedback}</p>
            <button
              className="btn dark"
              onClick={() => dialog.current?.close()}
            >
              Готово
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>
              Добавить материал
              <select
                value=""
                onChange={(e) => {
                  const id = e.target.value;
                  if (id) setQty(id, (basket[id] || 0) + 1);
                }}
              >
                <option value="">Выберите позицию</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            {products
              .filter((p) => basket[p.id])
              .map((p) => (
                <div className="basket-row" key={p.id}>
                  <strong>{p.name}</strong>
                  <input
                    type="number"
                    aria-label={"Количество: " + p.name}
                    min=".001"
                    max="9999999"
                    step=".001"
                    value={basket[p.id]}
                    onChange={(e) => {
                      if (+e.target.value > 0) setQty(p.id, +e.target.value);
                    }}
                  />
                  <span>{p.unit}</span>
                  <button
                    type="button"
                    aria-label={"Удалить " + p.name}
                    onClick={() => setQty(p.id, 0)}
                  >
                    ×
                  </button>
                </div>
              ))}
            <div className="form-grid">
              <label>
                Имя
                <input
                  name="name"
                  autoComplete="given-name"
                  maxLength={120}
                  required
                />
              </label>
              <label>
                Телефон или почта
                <input
                  name="contact"
                  autoComplete="email"
                  required
                  maxLength={180}
                />
              </label>
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
              {!staticMode && (
                <label>
                  Спецификация до 8 МБ
                  <input type="file" name="file" accept=".pdf,.xls,.xlsx" />
                </label>
              )}
            </div>
            <label>
              Материалы, объём или комментарий
              <textarea name="note" rows={2} maxLength={2900} />
            </label>
            <label className="check">
              <input type="checkbox" name="consent" value="yes" required />
              Согласен на обработку данных для расчёта и обратной связи.
            </label>
            {staticMode && (
              <p>Скачайте заявку и отправьте её менеджеру по почте.</p>
            )}
            <p role="status">{feedback}</p>
            <button className="btn primary" disabled={busy}>
              {busy
                ? "Подготовка…"
                : staticMode
                  ? "Скачать заявку"
                  : "Отправить заявку"}{" "}
              <Arrow />
            </button>
          </form>
        )}
      </dialog>
    </Context.Provider>
  );
}
