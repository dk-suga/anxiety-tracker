export function parseImport(text) {
  let parsed;
  try { parsed=JSON.parse(text); } catch { throw Error('Не удалось прочитать JSON.'); }
  if(parsed?.format && (parsed.format!=='anxiety-tracker'||parsed.version!==1))throw Error('Неизвестный формат файла.');
  const input=parsed?.entries??parsed;
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('В файле нет записей по датам.');
  const result={};
  for(const [key,value] of Object.entries(input)){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(key))throw Error('Неверная дата в файле.');
    const date=new Date(key+'T12:00:00Z');
    if(Number.isNaN(date.valueOf())||date.toISOString().slice(0,10)!==key)throw Error('Несуществующая дата в файле.');
    if(!value||!['none','low','medium','high'].includes(value.level))throw Error('Неизвестный уровень тревоги.');
    const note=value.note??''; const tags=value.tags??[];
    if(typeof note!=='string'||note.length>10000||!Array.isArray(tags)||tags.length>50||tags.some(t=>typeof t!=='string'||!t.trim()||t.length>100))throw Error('Проверь текст и теги в файле.');
    result[key]={level:value.level,note,tags:[...new Set(tags.map(t=>t.trim()))]};
  }
  if(Object.keys(result).length===0)throw Error('Файл не содержит записей.');
  return result;
}
