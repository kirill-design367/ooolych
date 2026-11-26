"use client";
import Link from "next/link";
import { useState } from "react";
import { Brand, Arrow, useSupply } from "../components/Supply";
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
          <button className="btn dark" onClick={request}>
            Запросить расчёт
          </button>
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
                  tabIndex={copy ? -1 : undefined}
                  key={section.id}
                  href={"/catalog/?c=" + section.id}
                >
                  {section.name}
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
          <label>
            Материал
            <select
              value={item?.id || ""}
              onChange={(e) => choose(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <label>
              Количество, {item?.unit}
              <input
                type="number"
                min=".001"
                max="9999999"
                step=".001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
            <label>
              От МКАД, км
              <input
                type="number"
                min="0"
                step=".1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="sums" aria-live="polite">
            <span>
              Материалы <b>{valid ? price(quote.goods) : "—"}</b>
            </span>
            <span>
              Доставка <b>{valid ? price(quote.freight) : "—"}</b>
            </span>
            <strong>
              Итого <b>{valid ? price(quote.total) : "По запросу"}</b>
            </strong>
          </div>
          <button className="btn dark" disabled={!valid}>
            Отправить на просчёт <Arrow />
          </button>
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
              Весь каталог <Arrow />
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
          <h2>
            Как работаем<span>.</span>
          </h2>
          <DeliveryTruck />
          <div className="steps">
            {steps.map(([name, detail], i) => (
              <article key={name}>
                <small>0{i + 1}</small>
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
          <h3>Примеры комплектации</h3>
          <div className="examples">
            {[
              "Жилой дом — плиты и утеплитель",
              "Офис — перегородки и электрика",
              "Склад — кабель и лотки",
              "Мастерская — фанера и крепёж",
            ].map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </div>
      </section>
      <section className="callout">
        <div className="shell">
          <div>
            <h2>Есть спецификация?</h2>
            <p>Приложите файл или соберите список в каталоге.</p>
          </div>
          <button className="btn light" onClick={request}>
            Оставить заявку
          </button>
        </div>
      </section>
    </>
  );
}
