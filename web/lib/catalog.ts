// Ориентиры для предварительной сметы. Заменить согласованным прайсом.
export const categories = [
  {
    id: "sheets",
    name: "Листовые материалы",
    detail: "Фанера, плиты, гипсокартон",
  },
  { id: "insulation", name: "Изоляция", detail: "Тепло- и звукоизоляция" },
  { id: "cable", name: "Кабель и провод", detail: "Силовые и монтажные линии" },
  {
    id: "electrical",
    name: "Электромонтаж",
    detail: "Фурнитура и оборудование",
  },
];
export type Item = {
  id: string;
  name: string;
  category: string;
  unit: string;
  rate: number;
  spec: string;
  image?: string;
};
const rows: [string, string, string, string, number, string][] = [
  ["plywood", "Фанера", "sheets", "лист", 1450, "Берёзовая, ФК"],
  ["osb", "Плита ОСП", "sheets", "лист", 850, "Для обшивки"],
  ["dvp", "Плита ДВП", "sheets", "лист", 280, "Древесноволокнистая"],
  ["dsp", "Плита ДСП", "sheets", "лист", 1200, "Древесностружечная"],
  ["drywall", "Гипсокартон", "sheets", "лист", 410, "Для перегородок"],
  [
    "xps",
    "Плиты ПЕНОПЛЭКС",
    "insulation",
    "упак.",
    1850,
    "Экструдированный полистирол",
  ],
  [
    "rockwool",
    "Минеральная вата",
    "insulation",
    "упак.",
    1350,
    "Каменное волокно",
  ],
  ["power-cable", "Силовой кабель", "cable", "м", 87, "Для силовых линий"],
  ["sip", "Провод СИП", "cable", "м", 65, "Самонесущий"],
  ["wire-install", "Монтажный провод", "cable", "м", 34, "Внутренняя разводка"],
  ["cctv", "Кабель видеонаблюдения", "cable", "м", 42, "Слаботочный"],
  [
    "switch",
    "Розетки и выключатели",
    "electrical",
    "шт.",
    215,
    "Установочные изделия",
  ],
  [
    "panel-parts",
    "Комплектующие щита",
    "electrical",
    "шт.",
    350,
    "Для сборки щита",
  ],
  [
    "switchboards",
    "Щитовое оборудование",
    "electrical",
    "шт.",
    1550,
    "Распределительные щиты",
  ],
  ["accessories", "Монтажные аксессуары", "electrical", "шт.", 35, "Крепёж"],
  [
    "boxes",
    "Монтажные коробки",
    "electrical",
    "шт.",
    49,
    "Установочные коробки",
  ],
  ["trays", "Кабельные лотки", "electrical", "м", 280, "Для прокладки кабеля"],
];
export const items: Item[] = rows.map(
  ([id, name, category, unit, rate, spec]) => ({
    id,
    name,
    category,
    unit,
    rate,
    spec,
  }),
);
export const delivery = { base: 3000, perKm: 65 };
export const price = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n) + " ₽";
export function estimate(item: Item, amount: number, km: number) {
  const goods = item.rate * amount,
    freight = delivery.base + delivery.perKm * km;
  return { goods, freight, total: goods + freight };
}
