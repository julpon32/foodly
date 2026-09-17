export type FoodGroup = 'produce' | 'fiber' | 'seafood' | 'animal'
type Food = { name: string; stems: string[]; groups: FoodGroup[] }
const food = (name: string, stems: string, groups: FoodGroup[] = []): Food => ({ name, stems: stems.split('|'), groups })
const pf: FoodGroup[] = ['produce', 'fiber']
export const foods: Food[] = [
  food('хлеб', 'хлеб|тост'), food('цельнозерновой хлеб', 'цельнозернов', ['fiber']),
  food('авокадо', 'авокадо', pf), food('яйцо', 'яйц|яиц|яич', ['animal']),
  food('помидор', 'помидор|томат|черри', pf), food('огурец', 'огурец|огурц', pf),
  food('лук', 'лук|луков', pf), food('чеснок', 'чеснок|чесноч', pf), food('морковь', 'морков', pf),
  food('свёкла', 'свекл', pf), food('капуста', 'капуст', pf), food('картофель', 'картофель|картофел|картош', pf),
  food('брокколи', 'брокколи', pf), food('шпинат', 'шпинат', pf), food('руккола', 'руккол|рукол', pf),
  food('перец', 'перец|перц', pf), food('кабачок', 'кабачок|кабачк', pf), food('баклажан', 'баклажан', pf),
  food('тыква', 'тыкв', pf), food('редис', 'редис', pf), food('сельдерей', 'сельдер', pf),
  food('яблоко', 'яблок|яблоч', pf), food('груша', 'груш', pf), food('банан', 'банан', pf),
  food('апельсин', 'апельсин', pf), food('мандарин', 'мандарин', pf), food('киви', 'киви', pf),
  food('манго', 'манго', pf), food('персик', 'персик', pf), food('виноград', 'виноград', pf),
  food('лимон', 'лимон', pf), food('клубника', 'клубник', pf), food('малина', 'малин', pf),
  food('черника', 'черник', pf), food('голубика', 'голубик', pf), food('ежевика', 'ежевик', pf),
  food('ягоды', 'ягод', pf), food('чечевица', 'чечевиц|чечевич', ['fiber']),
  food('нут', 'нут', ['fiber']), food('фасоль', 'фасол', ['fiber']), food('горох', 'горох|горош', ['fiber']),
  food('овсянка', 'овсян|овсянк', ['fiber']), food('гречка', 'греч', ['fiber']),
  food('киноа', 'киноа', ['fiber']), food('булгур', 'булгур', ['fiber']),
  food('грецкий орех', 'грецк', ['fiber']), food('миндаль', 'миндал', ['fiber']),
  food('орехи', 'орех', ['fiber']), food('семена чиа', 'чиа', ['fiber']), food('семена льна', 'льна|лен', ['fiber']),
  food('лосось', 'лосос|семг', ['seafood']), food('форель', 'форел', ['seafood']),
  food('тунец', 'тунец|тунц', ['seafood']), food('треска', 'треск', ['seafood']),
  food('сардины', 'сардин', ['seafood']), food('скумбрия', 'скумбри', ['seafood']),
  food('рыба', 'рыб', ['seafood']), food('креветки', 'кревет', ['seafood']),
  food('мидии', 'миди', ['seafood']), food('кальмар', 'кальмар', ['seafood']),
  food('курица', 'куриц|курин', ['animal']), food('индейка', 'индей|индюш', ['animal']),
  food('говядина', 'говядин|говяж', ['animal']), food('свинина', 'свинин|свин', ['animal']), food('баранина', 'баранин|баран', ['animal']),
  food('молоко', 'молок|молоч', ['animal']), food('творог', 'творог|творож', ['animal']),
  food('йогурт', 'йогурт', ['animal']), food('кефир', 'кефир', ['animal']),
  food('сыр', 'сыр', ['animal']), food('пармезан', 'пармезан', ['animal']),
  food('сметана', 'сметан', ['animal']), food('сливки', 'сливк', ['animal']),
  food('овсяное молоко', 'овсяноемолоко'), food('миндальное молоко', 'миндальноемолоко'), food('кокосовое молоко', 'кокосовоемолоко'), food('соевое молоко', 'соевоемолоко'), food('растительное молоко', 'растительноемолоко'),
  food('мука', 'мук'), food('рис', 'рис'), food('макароны', 'макарон|паст|спагетти'),
  food('грибы', 'гриб|шампиньон'), food('чай', 'чай|чаем|чая'), food('кофе', 'кофе'),
  food('мёд', 'мед'), food('сахар', 'сахар'), food('соль', 'соль|соли'),
  food('оливковое масло', 'оливков'), food('сливочное масло', 'сливоч'),
]
const normalize = (text: string) => text.toLocaleLowerCase('ru').replaceAll('ё', 'е').trim()
const endings = /^(?:ь|ью|а|я|у|ю|ы|и|е|о|ом|ем|ой|ей|ов|ев|ам|ям|ах|ях|ами|ями|ку|ка|ки|ке|кой|ками|ках|кам|ку|ную|ный|ная|ное|ные|ного|ному|ным|ных|ными|ый|ая|ое|ые|ого|ому|ым|ых|ыми|ий|яя|ее|ие|его|ему|им|их|ими|иный|иная|иное|иной|иного)?$/
function matches(token: string) {
  return foods.filter(f => f.stems.some(stem => token.startsWith(stem) && endings.test(token.slice(stem.length))))
}
function scan(text: string) {
  const explicit = new Set<string>(), excluded = new Set<string>()
  let negative = false
  const positiveTokens: string[] = []
  const prepared = normalize(text).replace(/(овсян[а-я]*|миндальн[а-я]*|кокосов[а-я]*|соев[а-я]*|растительн[а-я]*)\s+молок[а-я]*/g, (_, adjective: string) => {
    if (adjective.startsWith('овсян')) return 'овсяноемолоко'
    if (adjective.startsWith('миндальн')) return 'миндальноемолоко'
    if (adjective.startsWith('кокосов')) return 'кокосовоемолоко'
    if (adjective.startsWith('соев')) return 'соевоемолоко'
    return 'растительноемолоко'
  })
  for (const token of prepared.match(/[а-яa-z]+|[,.;:!?\n]/g) || []) {
    if (['без', 'кроме', 'исключая'].includes(token)) { negative = true; continue }
    if (['с', 'со', 'но', 'плюс', ';', '.', '!', '?', '\n'].includes(token)) { negative = false; continue }
    if (token === 'не') { negative = true; continue }
    if (!negative) positiveTokens.push(token)
    for (const f of matches(token)) (negative ? excluded : explicit).add(f.name)
  }
  // Specific names replace generic aliases from the same phrase.
  for (const [specific, generic] of [['цельнозерновой хлеб','хлеб'], ['грецкий орех','орехи']] as const) {
    if (explicit.has(specific)) explicit.delete(generic)
    if (excluded.has(specific)) excluded.add(generic)
  }
  for (const name of excluded) explicit.delete(name)
  return { explicit: [...explicit], excluded, positiveText: positiveTokens.join(' ') }
}
const recipes = [
  { pattern: /(?:^|\s)борщ[а-я]*(?=\s|[,.;!?]|$)/, ingredients: ['свёкла','капуста','картофель','морковь','лук'] },
  { pattern: /(?:^|\s)омлет[а-я]*(?=\s|[,.;!?]|$)/, ingredients: ['яйцо','молоко'] },
  { pattern: /(?:^|\s)сырник[а-я]*(?=\s|[,.;!?]|$)/, ingredients: ['творог','яйцо','мука'] },
  { pattern: /(?:^|\s)винегрет[а-я]*(?=\s|[,.;!?]|$)/, ingredients: ['свёкла','картофель','морковь','огурец'] },
]
export function recognizeIngredients(text: string) {
  const { explicit, excluded, positiveText } = scan(text)
  const inferred = recipes.filter(r => r.pattern.test(positiveText)).flatMap(r => r.ingredients)
    .filter(name => !excluded.has(name) && !explicit.includes(name))
  return { explicit, inferred: [...new Set(inferred)] }
}
export function canonicalFood(value: string) {
  const exact = foods.find(f => normalize(f.name) === normalize(value))
  if (exact) return exact.name
  const result = scan(value).explicit
  return result.length === 1 ? result[0] : value.trim().toLocaleLowerCase('ru')
}
export const uniqueFoods = (values: string[]) => [...new Set(values.map(canonicalFood).filter(Boolean))]
export function groupCounts(values: string[]) {
  const counts: Record<FoodGroup, number> = { produce: 0, fiber: 0, seafood: 0, animal: 0 }
  let unknown = 0
  for (const value of uniqueFoods(values)) {
    const entry = foods.find(f => f.name === value)
    if (!entry) { unknown++; continue }
    for (const group of entry.groups) counts[group]++
  }
  return { counts, unknown }
}
