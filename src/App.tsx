import { useState } from 'react'
import './App.css'
import { Icon } from './Icons'
import { recognizeIngredients, uniqueFoods, groupCounts } from './food'
import type { FoodGroup } from './food'

type Tab = 'Home' | 'Diary' | 'Insights' | 'Recipes'
type Meal = { id: string; name: string; date: string; time: string; type: string; ingredients: string[] }
type Draft = Omit<Meal, 'id' | 'ingredients'> & { id?: string; ingredients: string[] }
const KEY = 'foodly.meals.v1'
const types = ['Завтрак', 'Обед', 'Ужин', 'Перекус']
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
const kindWord = (n: number) => n % 100 >= 11 && n % 100 <= 14 ? 'видов' : n % 10 === 1 ? 'вид' : n % 10 >= 2 && n % 10 <= 4 ? 'вида' : 'видов'
const timeNow = () => new Date().toTimeString().slice(0,5)
const unique = uniqueFoods
function readMeals(): { meals: Meal[]; error: string } {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { meals: [], error: '' }
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data) || !data.every(m => m && typeof m.id === 'string' && typeof m.name === 'string' && typeof m.date === 'string' && typeof m.time === 'string' && types.includes(m.type) && Array.isArray(m.ingredients) && m.ingredients.every((i: unknown) => typeof i === 'string'))) throw new Error()
    return { meals: data, error: '' }
  } catch { return { meals: [], error: 'Не удалось прочитать дневник. Сохранение отключено, чтобы не перезаписать прежние записи. Попробуйте открыть приложение заново.' } }
}
function App() {
  const [initial] = useState(readMeals)
  const [meals, setMeals] = useState<Meal[]>(initial.meals)
  const [tab, setTab] = useState<Tab>('Home')
  const [date, setDate] = useState(today)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [step, setStep] = useState<'input' | 'confirm' | 'saved'>('input')
  const [ingredient, setIngredient] = useState('')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(false)
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [recipeTab, setRecipeTab] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [closeConfirm, setCloseConfirm] = useState(false)
  const [parsedName, setParsedName] = useState<string | null>(null)
  const [inferred, setInferred] = useState<string[]>([])
  const [reparseConfirm, setReparseConfirm] = useState(false)
  const groupLabels: [FoodGroup, string][] = [['produce', 'Овощи и фрукты'], ['fiber', 'Клетчатка'], ['seafood', 'Рыба и морепродукты'], ['animal', 'Животный белок']]
  const greeting = new Date().getHours() < 12 ? 'Доброе утро' : new Date().getHours() < 18 ? 'Добрый день' : 'Добрый вечер'
  const periodSwitcher = <div className="segmented period-tabs"><button aria-pressed={period === 'week'} className={period === 'week' ? 'selected' : ''} onClick={() => setPeriod('week')}>Эта неделя</button><button aria-pressed={period === 'month'} className={period === 'month' ? 'selected' : ''} onClick={() => setPeriod('month')}>Этот месяц</button></div>
  const dayMeals = meals.filter(m => m.date === date).sort((a,b) => a.time.localeCompare(b.time))
  const start = new Date(`${today()}T00:00:00`)
  if (period === 'week') start.setDate(start.getDate() - (start.getDay() + 6) % 7)
  else start.setDate(1)
  const periodMeals = meals.filter(m => new Date(`${m.date}T00:00:00`) >= start && m.date <= today())
  const overview = groupCounts(periodMeals.flatMap(m => m.ingredients))
  const productCount = (list: Meal[]) => unique(list.flatMap(m => m.ingredients)).length
  function begin(meal?: Meal) {
    setDraft(meal ? { ...meal, ingredients: [...meal.ingredients] } : { name: '', date: tab === 'Diary' ? date : today(), time: timeNow(), type: 'Завтрак', ingredients: [] })
    setStep('input'); setIngredient(''); setError(''); setCloseConfirm(false); setParsedName(meal?.name ?? null); setInferred([]); setReparseConfirm(false); setDeleteId(null)
  }
  function parseDraft() {
    if (!draft) return
    const result = recognizeIngredients(draft.name)
    setDraft({ ...draft, ingredients: [...result.explicit, ...result.inferred] })
    setInferred(result.inferred); setParsedName(draft.name); setReparseConfirm(false); setIngredient(''); setError(''); setStep('confirm')
  }
  function continueDraft() {
    if (!draft?.name.trim()) return
    if (parsedName === null) parseDraft()
    else { setStep('confirm'); setError('') }
  }
  function persist(next: Meal[]) {
    if (initial.error) { setError(initial.error); return false }
    try { localStorage.setItem(KEY, JSON.stringify(next)); setMeals(next); setError(''); return true }
    catch { setError('Не удалось сохранить на устройстве. Проверьте доступ к хранилищу и повторите попытку. Ваш ввод остаётся в форме.'); return false }
  }
  function addIngredient() {
    const next = unique(ingredient.split(/[,;\n]/))
    if (!draft || !next.length) return
    setDraft({ ...draft, ingredients: unique([...draft.ingredients, ...next]) }); setIngredient(''); setError('')
  }
  function save() {
    if (!draft) return
    const ingredients = unique([...draft.ingredients, ...ingredient.split(/[,;\n]/)])
    if (!ingredients.length) { setError('Добавьте хотя бы один ингредиент.'); return }
    const meal: Meal = { ...draft, name: draft.name.trim(), ingredients, id: draft.id || crypto.randomUUID() }
    if (persist([...meals.filter(m => m.id !== meal.id), meal])) { setDraft(meal); setIngredient(''); setDate(meal.date); setStep('saved') }
  }
  const close = () => { if (step === 'saved') setDraft(null); else setCloseConfirm(true) }
  const cards = (list: Meal[]) => list.map(m => <button className="meal-card" key={m.id} onClick={() => begin(m)}><span className="meal-mark"><Icon name="leaf"/></span><span className="meal-copy"><small>{m.type} · {m.time}</small><strong>{m.name}</strong><span>{m.ingredients.join(' · ')}</span></span><Icon name="next"/></button>)
  return <div className="app">
    <div inert={draft ? true : undefined}><header><a className="brand" href="#" onClick={e => { e.preventDefault(); setTab('Home'); setProfile(false) }}><Icon name="brand"/><span className="brand-word">foodly</span></a><button className="avatar" aria-label="Профиль и настройки" onClick={() => setProfile(true)}><Icon name="profile"/></button></header>
    <main>
      {initial.error && <p className="error" role="alert">{initial.error}</p>}
      {profile ? <><button className="text-button" onClick={() => setProfile(false)}>← Назад</button><p className="eyebrow">ВАШ FOODLY</p><h1>Профиль</h1><section className="panel"><h2>Маленькие шаги.<br/>Больше разнообразия.</h2><p>Foodly помогает замечать продукты в вашем рационе. Он не оценивает здоровье и не диагностирует дефициты.</p></section><section className="panel"><h3>Хранение записей</h3><p>Сейчас дневник хранится только в этом браузере на этом устройстве. После очистки данных браузера записи могут исчезнуть. Синхронизации с Telegram и другими устройствами пока нет.</p></section></> : <>
      {tab === 'Home' && <section className="home-dashboard">
        <h1 className="greeting">{greeting}<span className="greeting-moon"><Icon name="moon" filled/></span></h1>
        {periodSwitcher}
        <div className="diversity-ring" aria-label={`${productCount(periodMeals)} разных продуктов за выбранный период`}>
          <svg className="ring-outline" viewBox="0 0 200 180" aria-hidden="true"><path d="M34 144 A82 82 0 1 1 166 144" fill="none" stroke="#d4dfc8" strokeWidth="11" strokeLinecap="round"/></svg>
          <div className="ring-value"><strong>{productCount(periodMeals)}</strong><span>разных продуктов <Icon name="leaf"/></span></div>
        </div>
        <p className="ring-caption">{periodMeals.length ? 'Разнообразие начинается' : 'Ваша история питания'}<br/>{periodMeals.length ? 'с маленьких открытий' : 'начинается с первой записи'}</p>
        <p className="period-dates">{start.toLocaleDateString('ru-RU', { day:'numeric', month:'long' })} — {new Date().toLocaleDateString('ru-RU', { day:'numeric', month:'long' })}</p>
        <div className="food-groups">{groupLabels.map(([key,label]) => <div className="food-group" key={key}><span className={`group-icon ${key}`}><Icon name={key}/></span><span>{label}</span><strong>{overview.counts[key]} <small>{kindWord(overview.counts[key])}</small></strong></div>)}</div>
        <p className="group-note">По продуктам в дневнике · группы могут пересекаться.<br/>Клетчатка — продукты-источники, не количество в граммах.{overview.unknown > 0 && ` Без определённой группы: ${overview.unknown}.`}</p>
        {!periodMeals.length && <button className="text-button first-meal" onClick={() => begin()}><Icon name="plus"/> Добавить первый приём пищи</button>}
        <section className="food-ideas"><h2>Идеи для разнообразия</h2><div className="food-tiles">{[['lentils','Чечевица'],['salmon','Лосось'],['berries','Ягоды'],['spinach','Шпинат']].map(([file,label]) => <button key={file} onClick={() => setTab('Insights')} aria-label={`${label} — открыть Insights`}><img src={`${import.meta.env.BASE_URL}food/${file}.webp`} alt={label} width="100" height="100"/><span>{label}</span></button>)}</div><p className="group-note">Общие идеи · подробнее в Insights</p></section>
      </section>}
      {tab === 'Diary' && <><p className="eyebrow">ОДИН ДЕНЬ ЗА ДРУГИМ</p><h1>Мой дневник</h1><p className="intro">Всё, что вы ели. Без оценок и давления.</p><div className="date-row"><label>Выберите день<input aria-label="Дата дневника" type="date" value={date} max={today()} onChange={e => e.target.value && setDate(e.target.value)}/></label><button className="text-button" onClick={() => setDate(today())}>Сегодня</button></div><div className="stat-strip"><strong>{productCount(dayMeals)}</strong><span>разных продуктов за день</span></div>{dayMeals.length ? cards(dayMeals) : <section className="empty"><span className="empty-symbol">◌</span><h2>День с чистого листа</h2><p>Добавьте первый приём пищи.<br/>Каждая маленькая запись имеет значение.</p></section>}<button className="primary full" onClick={() => begin()}><Icon name="plus"/> Добавить еду</button></>}
      {tab === 'Insights' && <><p className="eyebrow">ВАША КАРТИНА ПИТАНИЯ</p><h1>Больше осознанности</h1><p className="intro">Разнообразие начинается с наблюдения.</p><div className="segmented"><button aria-pressed={period === 'week'} className={period === 'week' ? 'selected' : ''} onClick={() => setPeriod('week')}>Неделя</button><button aria-pressed={period === 'month'} className={period === 'month' ? 'selected' : ''} onClick={() => setPeriod('month')}>Месяц</button></div><p className="muted">{start.toLocaleDateString('ru-RU', { day:'numeric', month:'long' })} — {new Date().toLocaleDateString('ru-RU', { day:'numeric', month:'long' })}</p><section className="panel lavender"><span className="eyebrow">ПО ВАШИМ ЗАПИСЯМ</span><div className="big-number">{productCount(periodMeals)}</div><h2>разных продуктов</h2><p>{periodMeals.length ? `Приёмов пищи в дневнике: ${periodMeals.length}. Повторяющиеся названия учитываются один раз.` : 'Добавьте еду, чтобы начать собирать свою картину питания.'}</p></section><section className="panel"><span className="pill">Следующий этап</span><h3>Diversity Score</h3><p>Появится после согласования правил оценки. Пока показываем только реальные продукты из дневника.</p></section><section className="panel"><h3>Персональные рекомендации</h3><p>Здесь будут идеи, что добавить в рацион, и переход к подходящим рецептам. Этот раздел пока в разработке.</p></section></>}
      {tab === 'Recipes' && <><p className="eyebrow">ОТ ИДЕИ К ТАРЕЛКЕ</p><h1>Что приготовим?</h1><p className="intro">Место для новых любимых блюд.</p><div className="segmented"><button className={!recipeTab ? 'selected' : ''} aria-pressed={!recipeTab} onClick={() => setRecipeTab(false)}>Рецепты</button><button className={recipeTab ? 'selected' : ''} aria-pressed={recipeTab} onClick={() => setRecipeTab(true)}>План меню</button></div><section className="empty"><span className="empty-symbol">{recipeTab ? '▦' : '❋'}</span><span className="pill">Скоро в Foodly</span><h2>{recipeTab ? 'Меню на ваши дни' : 'Вдохновение для рациона'}</h2><p>{recipeTab ? 'Здесь можно будет распределять блюда по дням и приёмам пищи. Запланированные блюда будут отделены от съеденных.' : 'Здесь появятся рецепты и идеи блюд. А пока начните дневник — он станет основой ваших рекомендаций.'}</p><button className="primary" onClick={() => begin()}>Добавить еду в дневник</button></section></>}
      </>}
    </main></div>
    {!draft && <nav aria-label="Основная навигация">{(['Home','Diary','Add','Insights','Recipes'] as const).map(item => item === 'Add' ? <button key={item} className="nav-add" aria-label="Добавить еду" onClick={() => begin()}><Icon name="plus"/></button> : <button key={item} className={!profile && tab === item ? 'active' : ''} aria-current={!profile && tab === item ? 'page' : undefined} onClick={() => { setTab(item); setProfile(false) }}><Icon name={item} filled={item === 'Home' && tab === 'Home' && !profile}/><span>{item}</span></button>)}</nav>}
    {draft && <div className="editor" role="dialog" aria-modal="true" aria-label="Добавление и редактирование еды"><div className="editor-inner"><div className="editor-top"><button className="text-button" onClick={() => step === 'confirm' ? setStep('input') : close()}>← {step === 'confirm' ? 'Назад' : 'Закрыть'}</button><span className="brand"><Icon name="brand"/><span className="brand-word">foodly</span></span></div>{closeConfirm ? <section className="panel"><h2>Закрыть без сохранения?</h2><p>Изменения в этой форме будут потеряны.</p><button className="primary full" onClick={() => setCloseConfirm(false)}>Продолжить запись</button><button className="text-button full" onClick={() => { setDraft(null); setCloseConfirm(false) }}>Не сохранять и закрыть</button></section> : step === 'saved' ? <section className="saved"><span className="success-mark"><Icon name="check"/></span><p className="eyebrow">ГОТОВО</p><h1>Ещё один шаг<br/>к разнообразию.</h1><p>Приём пищи сохранён на этом устройстве.</p><section className="panel"><small>{draft.date} · {draft.type}</small><h2>{draft.name}</h2><p>{draft.ingredients.join(' · ')}</p></section><button className="primary full" onClick={() => { setDraft(null); setProfile(false); setTab('Diary') }}>Посмотреть в дневнике →</button><button className="text-button full" onClick={() => { setDraft(null); setProfile(false); setTab('Home') }}>На главную</button></section> : <><p className="eyebrow">{step === 'input' ? 'ШАГ 1 ИЗ 2 · ЗАПИСЬ' : 'ШАГ 2 ИЗ 2 · СОСТАВ'}</p><h1>{step === 'input' ? 'Что вы ели?' : 'Проверим ингредиенты'}</h1>{step === 'input' ? <form onSubmit={e => { e.preventDefault(); continueDraft() }}><div className="input-modes"><span className="pill">Текст</span><span>Голос · скоро</span><span>Фото · скоро</span></div><label>Блюдо или описание<textarea required maxLength={500} value={draft.name} onChange={e => setDraft({ ...draft, name:e.target.value })} placeholder="Например: тост с авокадо и яйцом"/></label><div className="form-row"><label>Дата<input required type="date" max={today()} value={draft.date} onChange={e => setDraft({ ...draft, date:e.target.value })}/></label><label>Время<input required type="time" value={draft.time} onChange={e => setDraft({ ...draft, time:e.target.value })}/></label></div><fieldset><legend>Приём пищи</legend><div className="type-options">{types.map(t => <button type="button" key={t} aria-pressed={draft.type === t} className={draft.type === t ? 'selected' : ''} onClick={() => setDraft({ ...draft, type:t })}>{t}</button>)}</div></fieldset><p className="muted">Foodly предложит ингредиенты по описанию. На следующем шаге проверьте состав — граммы и калории не нужны.</p><button className="primary full" type="submit">К ингредиентам →</button></form> : <><p className="intro">{draft.name}</p><p className="muted">{draft.ingredients.length ? 'Проверьте список: исправьте название, уберите лишнее или добавьте недостающее.' : 'Не удалось определить состав. Добавьте ингредиенты вручную — описание блюда сохранено.'}</p>{inferred.length > 0 && <p className="recognition-note">Есть предположения о составе блюда. Они отмечены ниже — подтвердите или исправьте их перед сохранением.</p>}{parsedName !== null && parsedName !== draft.name && <p className="recognition-note">Описание изменилось. Ваши правки состава сохранены. При необходимости распознайте новое описание заново.</p>}<button className="text-button" onClick={() => setReparseConfirm(true)}>Распознать заново</button>{reparseConfirm && <div className="recognition-note"><p>Заменить текущий список результатом распознавания? Ручные изменения состава будут заменены.</p><button className="text-button" onClick={parseDraft}>Заменить список</button><button className="text-button" onClick={() => setReparseConfirm(false)}>Оставить мои правки</button></div>}<div className="ingredient-list">{draft.ingredients.map((item, i) => <div className="ingredient-entry" key={i}>{inferred.includes(item) && <small className="inferred-label">Предположение — проверьте</small>}<div className="ingredient-row"><input aria-label={`Ингредиент ${i+1}`} value={item} onChange={e => setDraft({ ...draft, ingredients: draft.ingredients.map((v,n) => n === i ? e.target.value : v) })}/><button aria-label={`Удалить ${item}`} onClick={() => setDraft({ ...draft, ingredients: draft.ingredients.filter((_,n) => n !== i) })}><Icon name="close"/></button></div></div>)}</div><form onSubmit={e => { e.preventDefault(); addIngredient() }}><label>Новый ингредиент<div className="ingredient-row"><input value={ingredient} onChange={e => setIngredient(e.target.value)} placeholder="Авокадо, яйцо, хлеб"/><button aria-label="Добавить ингредиент" type="submit"><Icon name="plus"/></button></div></label><p className="muted">Несколько продуктов можно разделить запятой.</p></form><button className="primary full" onClick={save}>Сохранить приём пищи</button></>}{error && <p className="error" role="alert">{error}</p>}{draft.id && <div className="delete-area">{deleteId === draft.id ? <><p>Удалить этот приём пищи из дневника?</p><button className="danger" onClick={() => { if (persist(meals.filter(m => m.id !== draft.id))) { setDraft(null); setDeleteId(null) } }}>Да, удалить</button><button className="text-button" onClick={() => setDeleteId(null)}>Отмена</button></> : <button className="text-button danger" onClick={() => setDeleteId(draft.id!)}>Удалить запись</button>}</div>}</>}</div></div>}
  </div>
}
export default App
