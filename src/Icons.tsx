export function Icon({ name, filled = false }: { name: string; filled?: boolean }) {
 const paths: Record<string,string> = {
 Home:'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',
 Diary:'M6 3h13v18H6Z M3 6h5 M3 11h5 M3 16h5 M11 8h5 M11 12h5',
 Insights:'M3 20v-6h4v6Z M10 20V9h4v11Z M17 20V3h4v17Z',
 Recipes:'M12 6Q7 2 2 5v15q5-3 10 1 5-4 10-1V5q-5-3-10 1Zm0 0v15 M15 13q0-5 5-5-1 5-5 5Z',
 profile:'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a8 8 0 0 1 16 0v2',
 plus:'M12 5v14 M5 12h14', close:'M6 6l12 12 M6 18 18 6', back:'M20 12H4m6-6-6 6 6 6', next:'m9 5 7 7-7 7',
 check:'m4 12 5 5L20 6', edit:'m4 16-1 5 5-1L21 7l-5-5Z M13 5l5 5', delete:'M4 6h16 M9 6V3h6v3 M6 6l1 15h10l1-15 M10 10v7 M14 10v7',
 date:'M4 5h16v16H4Z M8 2v6 M16 2v6 M4 10h16', time:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v6l4 2',
 brand:'M12 21Q1 17 3 6q10 1 9 15Zm0 0Q11 6 22 3q0 13-10 18 M12 21 6 11 M12 21l7-12',
 leaf:'M5 20Q0 5 21 3q0 18-16 17ZM5 20 17 7',
 moon:'M18 19A9 9 0 0 1 11 2a9 9 0 1 0 7 17Z',
 produce:'M10 7q-6-4-8 2-1 6 5 11 3-1 5-4 M7 6 6 3 M8 6q0-5 5-4-1 4-5 4 M13 19q-3-3 1-6-2-4 2-5 2-5 5-1 4 2 0 6 1 5-4 5l-4 4 M14 20l5-10',
 fiber:'M10 22V7 M10 8Q4 8 4 3q6 0 6 5 M10 13q-6 0-6-5 6 0 6 5 M10 18q-6 0-6-5 6 0 6 5 M10 8q6 0 6-5-6 0-6 5 M10 13q6 0 6-5-6 0-6 5 M13 22q0-8 9-8-1 8-9 8Z',
 seafood:'M2 8q7-9 14 0-7 9-14 0Z M16 8l5-5v10Z M6 7h.1 M19 17q-8-5-9 1 0 5 6 4l-2-2 4-1 M11 17l3 1',
 animal:'M2 11q0-6 6-7 7 0 5 6-1 3-5 3-3 0-3 4-4 1-3-6Z M5 10q0-4 4-3 2 2-2 3Z M17 21q-6-1 0-12 7 11 0 12Z',
 }
 return <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.leaf}/></svg>
}
