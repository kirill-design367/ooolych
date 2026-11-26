"use client";
import Link from "next/link";
import { useState } from "react";
import { Arrow, useSupply } from "../components/Supply";
import { heroPhoto, mobileHeroPhoto, materialPhoto } from "../lib/assets";
import { estimate, price } from "../lib/catalog";

const steps = [
  ["Заявка", "Пришлите список материалов, количество и адрес объекта."],
  ["Расчёт", "Уточняем позиции, стоимость и условия доставки."],
  ["Согласование", "Проверяете спецификацию, сроки и документы."],
  ["Отгрузка", "Согласуем окно разгрузки и контакт на площадке."],
  ["Документы", "Комплект документов передаём по согласованным условиям."],
];
export default function Home() {
  const { products, sections, setQty, request, travel } = useSupply(),
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
          <div className="hero-mark" role="img" aria-label="Луч">
            <i />
            <i />
            <i />
          </div>
          <h1>Стройматериалы на объект</h1>
          <p>Комплектация и поставка по Москве и области</p>
          <button className="btn dark" onClick={request}>
            Запросить расчёт
          </button>
        </div>
      </section>
      <div className="index-strip">
        <div className="shell index-inner">
          <span className="index-label">Направления</span>
          {sections.map((s, i) => (
            <Link href={"/catalog/?c=" + s.id} key={s.id}>
              <small>{String(i + 1).padStart(2, "0")}</small>
              {s.name}
            </Link>
          ))}
        </div>
      </div>
      <section id="estimate" className="shell section estimate">
        <div>
          <p className="over">
            <i className="rule" />
            Предварительная смета
          </p>
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
              <p className="over">
                <i className="rule" />
                Ассортимент
              </p>
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
                  className={"cat cat-" + i}
                  href={"/catalog/?c=" + s.id}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey) return;
                    e.preventDefault();
                    travel(s.id);
                  }}
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
                    <h3 id={"cat-" + s.id}>{s.name}</h3>
                    <p>{s.detail}</p>
                    <strong>
                      {rates[0]
                        ? "от " + price(rates[0].rate) + " / " + rates[0].unit
                        : "По запросу"}
                    </strong>
                    <Arrow diagonal />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="shell section twin" id="supply">
        <div>
          <p className="over">
            <i className="rule" />
            Для снабжения
          </p>
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
          ].map((v, i) => (
            <div key={v}>
              <small>0{i + 1}</small>
              {v}
            </div>
          ))}
        </div>
      </section>
      <section className="process">
        <div className="shell section">
          <h2>
            Как работаем<span>.</span>
          </h2>
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
          <p className="over">
            <i className="rule" />
            География поставок
          </p>
          <h2>
            Москва
            <br />и область<span>.</span>
          </h2>
        </div>
        <div>
          <div className="area-diagram" aria-label="Схема региона поставки">
            <span>Москва</span>
            <span>Подольск</span>
          </div>
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
            Оставить заявку <Arrow diagonal />
          </button>
        </div>
      </section>
    </>
  );
}
