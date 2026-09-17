import test from 'node:test'
import assert from 'node:assert/strict'
import { recognizeIngredients, uniqueFoods, groupCounts } from '../src/food.ts'
test('explicit ingredients, inflections and duplicates', () => {
 assert.deepEqual(recognizeIngredients('Тост с авокадо и яйцом, ещё яйцо').explicit, ['хлеб','авокадо','яйцо'])
 assert.deepEqual(recognizeIngredients('Паста с креветками, томатами и пармезаном').explicit, ['макароны','креветки','помидор','пармезан'])
})
test('negative lists are excluded from explicit and inferred products', () => {
 const r = recognizeIngredients('Борщ без лука и чеснока')
 assert.ok(![...r.explicit,...r.inferred].includes('лук'))
 assert.ok(r.inferred.includes('свёкла'))
 assert.deepEqual(recognizeIngredients('тост без яйца с авокадо').explicit, ['хлеб','авокадо'])
 assert.deepEqual(recognizeIngredients('без омлета').inferred, [])
})
test('unknown descriptions do not produce food from partial words', () => {
 assert.deepEqual(recognizeIngredients('Мистическое блюдо'), { explicit:[], inferred:[] })
 assert.deepEqual(recognizeIngredients('чайник и нутриенты').explicit, [])
 assert.ok(!recognizeIngredients('сырники').explicit.includes('сыр'))
})
test('recipe defaults are assumptions, not explicit ingredients', () => {
 const r=recognizeIngredients('омлет без молока')
 assert.deepEqual(r.explicit, [])
 assert.deepEqual(r.inferred, ['яйцо'])
})
test('canonical counts and overlapping groups', () => {
 assert.deepEqual(uniqueFoods(['томаты','помидор','Помидоры','Яйцо','яйцом']), ['помидор','яйцо'])
 const r=groupCounts(['помидор','томаты','лосось','курица','яйцо','чечевица'])
 assert.deepEqual(r.counts, {produce:1,fiber:2,seafood:1,animal:2})
})
test('plant milk is not dairy or a serving of nuts', () => {
 const r=recognizeIngredients('кофе с миндальным молоком')
 assert.deepEqual(r.explicit,['кофе','миндальное молоко'])
 assert.equal(groupCounts(r.explicit).counts.animal,0)
})
test('dictionary products round-trip through recognition', async () => {
 const {foods}=await import('../src/food.ts')
 for(const f of foods) assert.ok(recognizeIngredients(f.name).explicit.includes(f.name), `recognize ${f.name}`)
})
