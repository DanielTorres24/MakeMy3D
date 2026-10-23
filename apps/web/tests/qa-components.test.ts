// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCustomizer } from '../src/components/commerce/product-customizer';
vi.stubGlobal('React',React);
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('formulário preserva personalização, envia quantidade numérica e apresenta erro da API',async()=>{
 vi.stubGlobal('React',React);
 const fetchMock=vi.fn().mockResolvedValue({ok:false,json:async()=>({error:'Artigo indisponível para compra.'})});vi.stubGlobal('fetch',fetchMock);
 const user=userEvent.setup();render(React.createElement(ProductCustomizer,{productId:'728403ee-973d-53e4-9f5e-809866d7fea6',materials:['PLA']}));
 await user.type(screen.getByLabelText('Texto a imprimir'),'Teste com acentos');await user.selectOptions(screen.getByLabelText('Material'),'PLA');
 const quantity=screen.getByLabelText('Quantidade');await user.clear(quantity);await user.type(quantity,'3');
 await user.click(screen.getByRole('button',{name:'Adicionar ao carrinho →'}));
 expect((await screen.findByRole('alert')).textContent).toContain('Artigo indisponível');
 const payload=JSON.parse(fetchMock.mock.calls[0][1].body);expect(payload.quantity).toBe(3);expect(payload.customization.text).toBe('Teste com acentos');expect(payload.customization.material).toBe('PLA');
 expect(screen.queryByRole('link',{name:'Ver carrinho e continuar →'})).toBeNull();
});
