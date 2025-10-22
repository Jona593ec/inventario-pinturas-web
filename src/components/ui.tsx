import React from 'react';

export function Button(
  { children, variant='default', ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default'|'primary'|'ghost' }
){
  const cls = ['btn', variant==='primary'?'primary':variant==='ghost'?'ghost':''].join(' ').trim();
  return <button className={cls} {...rest}>{children}</button>;
}

export function IconButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>){
  return <button className="icon-btn" {...props} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>){
  return <input className="input" {...props} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>){
  return <select className="select" {...props} />;
}

export function Tabs(
  { value, onChange, items }:
  { value:string, onChange:(v:string)=>void, items:{ value:string, label:string }[] }
){
  return (
    <div className="tabs">
      {items.map(it => (
        <div
          key={it.value}
          className={`tab ${value===it.value?'active':''}`}
          onClick={()=>onChange(it.value)}
        >
          {it.label}
        </div>
      ))}
    </div>
  );
}

export function StatusChip({ status }:{ status:'OK'|'POR_VENCER'|'VENCIDO' }){
  const cls =
    status==='OK' ? 'chip badge-ok' :
    status==='POR_VENCER' ? 'chip badge-warn' :
    'chip badge-bad';
  const txt =
    status==='OK' ? 'OK' :
    status==='POR_VENCER' ? 'Por vencer' :
    'Vencido';
  return <span className={cls}>{txt}</span>;
}

export function Th({ children }:{ children:React.ReactNode }){
  return <th>{children}</th>;
}
export function Td({
  children, mono, colSpan,
}:{
  children:React.ReactNode, mono?:boolean, colSpan?:number
}){
  return (
    <td colSpan={colSpan} style={{ fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined }}>
      {children}
    </td>
  );
}
