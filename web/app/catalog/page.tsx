"use client";
import { materialPhoto } from "../../lib/assets";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSupply, Arrow } from "../../components/Supply";
import { price } from "../../lib/catalog";
const empty = { c: "", unit: "", q: "" };
export default function Catalog() {
  const { products, sections, basket, setQty, request, travel } = useSupply(),
    [filters, setFilters] = useState(empty);
  useEffect(() => {
    const read = () => {
      const url = new URLSearchParams(location.search);
      setFilters({
        c: url.get("c") || "",
        unit: url.get("unit") || "",
        q: url.get("q") || "",
      });
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  function change(k: keyof typeof filters, v: string) {
    const next = { ...filters, [k]: v };
    setFilters(next);
    const url = new URL(location.href);
    Object.entries(next).forEach(([key, val]) =>
      val ? url.searchParams.set(key, val) : url.searchParams.delete(key),
    );
    history.replaceState(null, "", url);
  }
  const filtered = products.filter(
    (p) =>
      (!filters.c || p.category === filters.c) &&
      (!filters.unit || p.unit === filters.unit) &&
      (p.name + " " + p.spec)
        .toLocaleLowerCase("ru")
        .includes(filters.q.trim().toLocaleLowerCase("ru")),
  );
  return (
    <section className="shell section catalog-page">
      <Link
        className="textlink"
        href="/"
        onClick={(e) => {
          if (filters.c && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            travel(filters.c, true);
          }
        }}
      >
        ← На главную
      </Link>
      <h1 id="catalog-title">
        {sections.find((s) => s.id === filters.c)?.name || "Каталог материалов"}
        <span>.</span>
      </h1>
      <p>
        Цены ориентировочные. Наличие и условия поставки уточняем при расчёте.
      </p>
      <div className="filters">
        <label>
          Направление
          <select
            value={filters.c}
            onChange={(e) => change("c", e.target.value)}
          >
            <option value="">Все направления</option>
            {sections.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Единица
          <select
            value={filters.unit}
            onChange={(e) => change("unit", e.target.value)}
          >
            <option value="">Все единицы</option>
            {[...new Set(products.map((p) => p.unit))].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Поиск
          <input
            type="search"
            value={filters.q}
            onChange={(e) => change("q", e.target.value)}
            placeholder="Название или характеристика"
          />
        </label>
      </div>
      <div className="results">
        <span aria-live="polite">Позиций: {filtered.length}</span>
        <button className="textlink" onClick={request}>
          Заявка ({Object.keys(basket).length}) <Arrow />
        </button>
      </div>
      <div className="product-list">
        {filtered.map((p, index) => (
          <article key={p.id}>
            <img
              className="listing-photo"
              src={materialPhoto(p.category, p.image)}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              width="640"
              height="300"
            />
            <small>{sections.find((s) => s.id === p.category)?.name}</small>
            <h2 className="product-title">{p.name}</h2>
            <p>{p.spec}</p>
            <div>
              <strong>
                {p.rate ? price(p.rate) + " / " + p.unit : "По запросу"}
              </strong>
              <button
                className="btn secondary small"
                onClick={() => (basket[p.id] ? request() : setQty(p.id, 1))}
              >
                {basket[p.id] ? "В заявке ✓" : "+ В заявку"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <p>
          Материалы не найдены. Измените фильтры или оставьте заявку на подбор.
        </p>
      )}
    </section>
  );
}
