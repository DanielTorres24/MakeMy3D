'use client';
import Link from 'next/link';
import {useState} from 'react';
import {api,CustomizationFields,customizationFrom} from './shared';
import styles from './commerce.module.css';
export function ProductCustomizer({productId,materials}:{productId:string;materials?:string[]}){
  const [attachments,setAttachments]=useState<{id:string;originalName:string}[]>([]),[uploading,setUploading]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[success,setSuccess]=useState(false);
  return <div className={styles.panel}><form className={styles.form} onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');setSuccess(false);const form=new FormData(e.currentTarget);try{await api('/api/cart','POST',{productId,quantity:Number(form.get('quantity')),customization:customizationFrom(form,attachments.map(a=>a.id))});setSuccess(true);setMessage('Artigo adicionado com a personalização escolhida.');}catch(error){setMessage(error instanceof Error?error.message:'Erro no pedido.');}finally{setBusy(false);}}}><CustomizationFields materials={materials} attachments={attachments} onAttachments={setAttachments} onUploading={setUploading}/><button className="button" disabled={busy||uploading}>{busy?'A adicionar…':'Adicionar ao carrinho →'}</button>{message&&<p role={success?'status':'alert'} className={styles.notice}>{message}</p>}{success&&<Link className="text-link" href="/carrinho">Ver carrinho e continuar →</Link>}</form></div>;
}
