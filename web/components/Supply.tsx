"use client";
import { HoverWord } from "./HoverWord";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
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

const RequestFields = dynamic(() => import("./RequestFields"), {
  loading: () => (
    <p className="request-done" role="status">
      Загружаем форму…
    </p>
  ),
});
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
};
const Context = createContext<Supply | null>(null);
export const useSupply = () => useContext(Context)!;
export function Brand({
  hero = false,
  inverse = false,
}: {
  hero?: boolean;
  inverse?: boolean;
}) {
  return (
    <img
      className={hero ? "hero-logo" : "brand-logo"}
      width="255"
      height="72"
      fetchPriority={hero ? "high" : undefined}
      alt="Луч"
      src={
        (process.env.NEXT_PUBLIC_BASE_PATH || "") +
        "/materials/luch.svg" +
        (inverse ? "#inverse" : "")
      }
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
  const [requested, setRequested] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    auth = useRef({ csrf: "", key: "" }),
    path = usePathname(),
    focus = useRef<HTMLElement | null>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const position = () => Math.min(1, Math.max(0, window.scrollY / 650));
    let displayed = position(),
      target = displayed,
      frame = 0,
      previous = 0;
    const draw = (now: number) => {
      const dt = previous ? Math.min(now - previous, 64) : 16;
      previous = now;
      displayed += (target - displayed) * (1 - Math.exp(-dt / 120));
      if (Math.abs(target - displayed) < 0.001) displayed = target;
      header.current?.style.setProperty("--scroll", displayed.toFixed(4));
      frame = displayed === target ? 0 : requestAnimationFrame(draw);
    };
    const update = () => {
      target = position();
      if (!frame) {
        previous = 0;
        frame = requestAnimationFrame(draw);
      }
    };
    header.current?.style.setProperty("--scroll", String(displayed));
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, []);
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
    setRequested(true);
    dialog.current?.showModal();
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
    <Context.Provider value={{ products, sections, basket, setQty, request }}>
      <a className="skip" href="#main">
        К содержанию
      </a>
      <header ref={header}>
        <div className="shell header-row">
          <Link href="/" aria-label="Луч — главная">
            <Brand />
          </Link>
          <nav
            className={menu ? "open" : ""}
            aria-label="Главное меню"
            onClick={() => setMenu(false)}
          >
            <Link href="/catalog/">
              <HoverWord>Каталог</HoverWord>
            </Link>
            <Link href="/#estimate">
              <HoverWord>Калькулятор</HoverWord>
            </Link>
            <Link href="/#supply">
              <HoverWord>Поставки</HoverWord>
            </Link>
            <Link href="/#contacts">
              <HoverWord>Контакты</HoverWord>
            </Link>
          </nav>
          <a className="tel" href="tel:+79201751446">
            +7 (920) 175-14-46
          </a>
          <button className="btn dark small" onClick={request}>
            Заявка {Object.keys(basket).length || ""}
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
      <footer id="contacts" className="contact-footer">
        <div className="shell footer-layout">
          <div className="footer-invite">
            <h2>Обсудим поставку?</h2>
            <button className="btn footer-action" onClick={request}>
              <HoverWord>Оставить заявку</HoverWord>
            </button>
          </div>
          <div className="footer-contact">
            <h3>Контакты</h3>
            <a href="tel:+79201751446">+7 (920) 175-14-46</a>
            <a href="mailto:1751416@internet.ru">1751416@internet.ru</a>
          </div>
          <Link href="/" className="footer-brand" aria-label="Луч — главная">
            <Brand inverse />
          </Link>
          <address>
            <strong>Подольск, Московская область</strong>
            тер. СНТ № 4 ПЭМЗ Красная Горка,
            <br />
            д. 4, стр. 1, ком. 4
          </address>
          <div className="footer-legal">
            <span>ООО «Луч»</span>
            <span>ИНН 5074081719</span>
            <span>ОГРН 1235000061548</span>
          </div>
        </div>
      </footer>
      <dialog
        className="request-dialog"
        ref={dialog}
        aria-labelledby="request-title"
        data-lenis-prevent
        onClose={() => focus.current?.focus()}
      >
        <div className="dialog-head">
          <h2 id="request-title" tabIndex={-1} autoFocus>
            Заявка на расчёт
          </h2>
          <button aria-label="Закрыть" onClick={() => dialog.current?.close()}>
            ×
          </button>
        </div>
        {complete ? (
          <div className="request-done" role="status">
            <p>{feedback}</p>
            <button
              className="btn dark"
              onClick={() => dialog.current?.close()}
            >
              Готово
            </button>
          </div>
        ) : (
          requested && (
            <RequestFields
              staticMode={staticMode}
              onSubmit={submit}
              busy={busy}
              feedback={feedback}
            />
          )
        )}
      </dialog>
    </Context.Provider>
  );
}
