const paths={
 people:'M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-4a6 6 0 0 1 12 0v4m1-16a3 3 0 0 1 0 6m2 3a5 5 0 0 1 5 5v2',
 chat:'M3 4h18v12H9l-6 5V4Zm4 4h10M7 12h6',
 crate:'m3 7 9-4 9 4v11l-9 4-9-4V7Zm0 0 9 4 9-4m-9 4v11M7.5 5l9 4v5',
 flag:'M5 22V3h14l-3 5 3 5H5',
 lock:'M6 10h12v11H6zM8 10V7a4 4 0 0 1 8 0v3',
 check:'m4 12 5 5L20 5',
 arrow:'M4 12h15m-6-6 6 6-6 6',
 back:'M20 12H5m6-6-6 6 6 6',
 target:'M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6M8 12h8m-4-4v8',
 tools:'m4 21 9-9m-4-8a6 6 0 0 0 8 8l4-4-5 1-1-5-3 3m-7 9 3 3',
 pause:'M8 5v14M16 5v14',
 play:'m8 4 12 8-12 8V4Z',
 rewind:'M5 11a8 8 0 1 1 1 7M5 4v7h7',
 plus:'M12 4v16M4 12h16',
 book:'M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3V4Zm9 2v16',
 door:'M4 21V3h16v18M7 7h10M7 11h10M7 15h10',
 lightning:'m13 2-9 12h7l-1 8L21 9h-8l0-7Z',
};
export const icon=(name,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.crate}"/></svg>`;
export const missionIcon=id=>({inscrits:'people',retours:'chat',boutiques:'crate',bonus:'flag'}[id]||'crate');
