'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import type {Customization} from '@/domain/schemas';
import {api,money} from './shared';
import styles from './commerce.module.css';
type Cart={items:{id:string;name:string;quantity:number;unitPriceCents:number;available:boolean;customization:Customization}[];totalCents:number};
export function CartView(){
 const [cart,setCart]=useState<Cart|null>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;api('/api/cart').then(data=>{if(active)setCart(data);}).catch(e=>{if(active)setMessage(e.message);});return()=>{active=false;};},[]);
 async function update(method:string,data:unknown){setBusy(true);setMessage('');try{setCart(await api('/api/cart',method,data));}catch(e){setMessage(e instanceof Error?e.message:'Não foi possível atualizar o carrinho. Tenta novamente.');}finally{setBusy(false);}}
 return <><p>Revê os artigos e a personalização antes de continuar. Os preços são indicativos e não será feita qualquer cobrança.</p>
 {message&&<p role="alert" className={styles.notice}>{message}</p>}
 {!cart&&!message&&<p role="status">A carregar carrinho…</p>}
 {busy&&<p role="status">A atualizar o carrinho…</p>}
 {cart&&!cart.items.length&&<div className={styles.panel}><h2>O teu carrinho está vazio</h2><p>Encontra uma ideia no catálogo e personaliza-a à tua medida.</p><Link className="button" href="/catalogo">Explorar catálogo →</Link></div>}
 {cart&&cart.items.length>0&&<><ul className={styles.list}>{cart.items.map(item=><li key={item.id}>
 <h2 style={{fontSize:'1.35rem'}}>{item.name}</h2><p>{item.available?`${money(item.unitPriceCents)} / unidade`:'Este artigo deixou de estar disponível. Retira-o para continuar.'}</p>
 <dl>{Object.entries(item.customization).filter(([key,value])=>key!=='attachmentIds'&&value).map(([key,value])=><div key={key}><dt className={styles.small}>{{text:'Texto',colour:'Cor',material:'Material',dimensions:'Dimensões',notes:'Observações'}[key]}</dt><dd>{String(value)}</dd></div>)}</dl>
 {item.customization.attachmentIds.length>0&&<p>{item.customization.attachmentIds.map((id,i)=><a key={id} className="text-link" style={{marginRight:12}} href={`/api/uploads/${id}`}>Anexo {i+1}</a>)}</p>}
 <div className={styles.actions}><form key={`${item.id}-${item.quantity}`} className={styles.actions} onSubmit={e=>{e.preventDefault();const quantity=Number(new FormData(e.currentTarget).get('quantity'));void update('PATCH',{id:item.id,quantity});}}><label className={styles.field}>Quantidade<input aria-label={`Quantidade de ${item.name}`} name="quantity" type="number" min={1} max={999} required defaultValue={item.quantity} disabled={busy}/></label><button type="submit" className={styles.remove} disabled={busy}>Atualizar quantidade</button></form><button className={styles.remove} disabled={busy} onClick={()=>void update('DELETE',{id:item.id})}>Remover</button><strong>{money(item.quantity*item.unitPriceCents)}</strong></div>
 </li>)}</ul><section className={styles.summary} aria-label="Resumo do carrinho"><p className={styles.total}>Subtotal: {money(cart.totalCents)}</p><p className={styles.small}>Sem portes nem cobrança. A personalização acompanha cada artigo.</p></section><div className={styles.actions}><Link className="text-link" href="/catalogo">Continuar a escolher</Link>{cart.items.every(i=>i.available)&&!busy&&<Link className="button" href="/checkout">Simular encomenda →</Link>}</div></>}
 </>;
}
