"use client";
import { HoverWord } from "../components/HoverWord";
import Link from "next/link";
import { useState } from "react";
import { ChoiceField } from "../components/ChoiceField";
import { Brand, useSupply } from "../components/Supply";
import { heroPhoto, mobileHeroPhoto, materialPhoto } from "../lib/assets";
import { DeliveryTruck, DeliveryMap } from "../components/DeliveryArt";
import { estimate, price } from "../lib/catalog";

const steps = [
  ["Заявка", "Пришлите список материалов, количество и адрес объекта."],
  ["Расчёт", "Уточняем позиции, стоимость и условия доставки."],
  ["Согласование", "Проверяете спецификацию, сроки и документы."],
  ["Отгрузка", "Согласуем окно разгрузки и контакт на площадке."],
  ["Документы", "Комплект документов передаём по согласованным условиям."],
];
export default function Home() {
  const { products, sections, setQty, request } = useSupply(),
    [chosen, choose] = useState("plywood"),
    [amount, setAmount] = useState("10"),
    [distance, setDistance] = useState("20");
  const item = products.find((p) => p.id === chosen) || products[0],
    quote = item && estimate(item, +amount, +distance),
    valid =
      !!item &&
      item.rate > 0 &&
      +amount > 0 &&
      +amount <= 9999999 &&
      distance !== "" &&
      +distance >= 0;
  return (
    <>
      <section className="studio-hero">
        <picture>
          <source media="(max-width: 680px)" srcSet={mobileHeroPhoto} />
          <img
            src={heroPhoto}
            alt=""
            fetchPriority="high"
            decoding="async"
            width="1672"
            height="941"
          />
        </picture>
        <div className="studio-copy">
          <Brand hero />
          <h1>Стройматериалы на объект</h1>
          <p>Комплектация и поставка по Москве и области</p>
          <div className="hero-actions">
            <button className="btn dark" onClick={request}>
              <HoverWord>Запросить расчёт</HoverWord>
            </button>
            <Link className="btn hero-catalog" href="/catalog/">
              <HoverWord>Каталог</HoverWord>
            </Link>
          </div>
        </div>
      </section>
      <nav className="materials-ticker" aria-label="Категории материалов">
        <div className="ticker-track">
          {[false, true].map((copy) => (
            <div
              key={String(copy)}
              className="ticker-group"
              aria-hidden={copy || undefined}
            >
              {sections.map((section) => (
                <Link
                  prefetch={false}
                  tabIndex={copy ? -1 : undefined}
                  key={section.id}
                  href={"/catalog/?c=" + section.id}
                >
                  <HoverWord>{section.name}</HoverWord>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </nav>
      <section id="estimate" className="shell section estimate">
        <div>
          <h2>
            Расчёт поставки<span>.</span>
          </h2>
          <p className="body-copy">
            Выберите материал и объём. Калькулятор покажет ориентир с доставкой
            от МКАД.
          </p>
        </div>
        <form
          className="estimate-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (item && valid) {
              setQty(item.id, +amount);
              request();
            }
          }}
        >
          <div className="estimate-material">
            {item && (
              <img
                src={materialPhoto(item.category, item.image)}
                alt=""
                loading="lazy"
                width="80"
                height="80"
              />
            )}
            <ChoiceField
              label="Материал"
              value={item?.id || ""}
              onChange={choose}
              options={products.map((p) => ({ value: p.id, label: p.name }))}
            />
          </div>
          <div className="form-grid">
            <label>
              Количество
              <span className="measure">
                <input
                  type="number"
                  min=".001"
                  max="9999999"
                  step=".001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <span>{item?.unit}</span>
              </span>
            </label>
            <label>
              Расстояние от МКАД
              <span className="measure">
                <input
                  type="number"
                  min="0"
                  step=".1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  required
                />
                <span>км</span>
              </span>
            </label>
          </div>
          <div className="quote-summary">
            <div className="sums" aria-live="polite">
              <span>
                Материалы <b>{valid ? price(quote.goods) : "—"}</b>
              </span>
              <span>
                Доставка <b>{valid ? price(quote.freight) : "—"}</b>
              </span>
              <strong>
                Итого с доставкой{" "}
                <b key={valid ? quote.total : "empty"}>
                  {valid ? price(quote.total) : "По запросу"}
                </b>
              </strong>
            </div>
            <button className="btn quote-action" disabled={!valid}>
              <HoverWord>Отправить на просчёт</HoverWord>
            </button>
          </div>
        </form>
      </section>
      <section className="catalog-band">
        <div className="shell section">
          <div className="section-head">
            <div>
              <h2>
                Каталог материалов<span>.</span>
              </h2>
            </div>
            <Link href="/catalog/" className="textlink">
              <HoverWord>Весь каталог</HoverWord>
            </Link>
          </div>
          <div className="cat-grid">
            {sections.map((s, i) => {
              const rates = products
                .filter((p) => p.category === s.id && p.rate > 0)
                .sort((a, b) => a.rate - b.rate);
              return (
                <Link
                  key={s.id}
                  id={"cat-" + s.id}
                  className={"cat cat-" + i}
                  href={"/catalog/?c=" + s.id}
                >
                  <img
                    className="material-photo"
                    src={materialPhoto(s.id)}
                    alt=""
                    loading="lazy"
                    width="640"
                    height="430"
                  />
                  <div className="cat-body">
                    <h3>{s.name}</h3>
                    <p>{s.detail}</p>
                    <strong>
                      {rates[0]
                        ? "от " + price(rates[0].rate) + " / " + rates[0].unit
                        : "По запросу"}
                    </strong>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="shell section twin" id="supply">
        <div>
          <h2>
            Поставка для
            <br />
            вашего бизнеса<span>.</span>
          </h2>
        </div>
        <div className="conditions">
          {[
            "Договор и спецификация",
            "Условия оплаты по запросу",
            "Закрывающие документы",
            "Согласование сертификатов",
            "Единый контакт по заявке",
            "График поставки под объект",
          ].map((v) => (
            <div key={v}>{v}</div>
          ))}
        </div>
      </section>
      <section className="process">
        <div className="shell section">
          <h2 className="process-title">
            Как работаем
            <span className="process-punctuation">?</span>
          </h2>
          <DeliveryTruck />
          <div className="stage-rail" aria-hidden="true">
            {steps.map(([name], i) => (
              <span key={name} data-station={i + 1}>
                0{i + 1}
              </span>
            ))}
          </div>
          <div className="steps">
            {steps.map(([name, detail], i) => (
              <article key={name}>
                <small data-station={i + 1}>0{i + 1}</small>
                <h3>{name}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="shell section twin">
        <div>
          <h2>
            Москва
            <br />и область<span>.</span>
          </h2>
        </div>
        <div>
          <DeliveryMap />
          <h3>Доставка под объём спецификации</h3>
          <p className="body-copy">
            Для расчёта рейса укажите адрес, дату приёмки и ограничения по
            въезду. Вид машины и условия разгрузки согласуем до отгрузки.
          </p>
        </div>
      </section>
    </>
  );
}
