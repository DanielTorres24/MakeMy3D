import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [320, 390, 768, 1440]) {
 test(`layout ${width}px: navegação, formulários e acessibilidade`, async ({page}) => {
  await page.setViewportSize({width, height:900});
  for (const route of ['/', '/catalogo', '/produtos/divisoria-de-gaveta', '/carrinho', '/checkout', '/orcamento', '/admin']) {
   await page.goto(route); await page.waitForLoadState('networkidle');
   await expect(page.locator('main')).toHaveCount(1);
   await expect(page.locator('#conteudo')).toBeVisible();
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
   const links=page.getByRole('navigation',{name:'Navegação principal'}).getByRole('link');
   for (const link of await links.all()) await expect(link).toBeVisible();
   if (width === 390) {
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),route).toEqual([]);
   }
  }
  await page.goto('/');await page.waitForLoadState('networkidle');
  await page.screenshot({path:`work/ux-home-${width}.png`,fullPage:true});
  await page.goto('/produtos/divisoria-de-gaveta');await page.waitForLoadState('networkidle');
  await page.screenshot({path:`work/ux-product-${width}.png`,fullPage:true});
 });
}

test('pesquisa, vazio, paginação e acesso por teclado',async({page})=>{
 await page.goto('/catalogo');await page.waitForLoadState('networkidle');
 await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Saltar para o conteúdo'})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page).toHaveURL(/#conteudo$/);
 await page.getByRole('searchbox',{name:'Pesquisar'}).fill('zzzz-sem-resultados');
 await page.getByRole('button',{name:'Aplicar filtros'}).click();
 await expect(page.getByRole('heading',{name:'Vamos tentar outra ideia?'})).toBeVisible();
 await page.getByRole('link',{name:'Limpar filtros'}).click();
 await page.getByRole('link',{name:'Página 2',exact:true}).click();
 await expect(page).toHaveURL(/page=2/);
 await expect(page.getByRole('link',{name:'Página 2',exact:true})).toHaveAttribute('aria-current','page');
});

test('gestão: criar, editar, ocultar, mostrar e eliminar dados fictícios',async({page})=>{
 const name=`Categoria QA ${Date.now()}`;const slug=`categoria-qa-${Date.now()}`;
 await page.goto('/admin');await page.getByLabel('Palavra-passe',{exact:true}).fill('qa-browser-demo');await page.getByRole('button',{name:'Entrar no backoffice'}).click();
 await page.getByRole('button',{name:'Categorias',exact:true}).click();await page.getByRole('button',{name:'Criar categoria',exact:true}).click();
 const editor=page.locator('form.admin-editor');await editor.getByLabel('Nome',{exact:true}).fill(name);await editor.getByLabel('Endereço (slug)').fill(slug);await editor.getByRole('button',{name:'Guardar',exact:true}).click();
 const record=page.locator('.admin-list article').filter({hasText:name});await expect(record).toBeVisible();
 await record.getByRole('button',{name:'Editar',exact:true}).click();await editor.getByLabel('Descrição',{exact:true}).fill('Uma categoria de teste.');await editor.getByRole('button',{name:'Guardar',exact:true}).click();
 await record.getByRole('button',{name:'Ocultar',exact:true}).click();await expect(record.getByRole('button',{name:'Mostrar',exact:true})).toBeVisible();
 await page.goto(`/catalogo?category=${slug}`);await expect(page.locator('.category-chips')).not.toContainText(name);
 await page.goto('/admin');await page.getByRole('button',{name:'Categorias',exact:true}).click();await record.getByRole('button',{name:'Mostrar',exact:true}).click();await expect(record.getByRole('button',{name:'Ocultar',exact:true})).toBeVisible();
 page.once('dialog',dialog=>dialog.accept());await record.getByRole('button',{name:'Eliminar',exact:true}).click();await expect(record).toHaveCount(0);
 await page.getByRole('button',{name:'Terminar sessão'}).click();await expect(page.getByRole('button',{name:'Entrar no backoffice'})).toBeVisible();
});

test('carrinho: editar quantidade livremente, validar e remover',async({page})=>{
 await page.goto('/produtos/divisoria-de-gaveta');await page.getByRole('button',{name:'Adicionar ao carrinho →'}).click();await page.getByRole('link',{name:'Ver carrinho e continuar →'}).click();
 const quantity=page.getByRole('spinbutton',{name:'Quantidade de Divisória de gaveta'});
 await quantity.fill('12');await page.getByRole('button',{name:'Atualizar quantidade'}).click();
 await expect(page.getByText('Subtotal: 102,00 €')).toBeVisible();
 await quantity.fill('0');await page.getByRole('button',{name:'Atualizar quantidade'}).click();expect(await quantity.evaluate((el:HTMLInputElement)=>el.validity.valid)).toBe(false);
 await quantity.fill('3');await page.getByRole('button',{name:'Atualizar quantidade'}).click();await expect(page.getByText('Subtotal: 25,50 €')).toBeVisible();
 await page.getByRole('button',{name:'Remover',exact:true}).click();await expect(page.getByRole('heading',{name:'O teu carrinho está vazio'})).toBeVisible();
});

test('formulário: erro de rede conserva texto e permite tentar novamente',async({page})=>{
 await page.goto('/produtos/divisoria-de-gaveta');await page.getByLabel('Texto a imprimir').fill('Não perder esta personalização');
 await page.route('**/api/cart',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Serviço temporariamente indisponível. Tenta novamente.'})}));
 await page.getByRole('button',{name:'Adicionar ao carrinho →'}).click();await expect(page.getByRole('alert').filter({hasText:'Serviço temporariamente'})).toBeVisible();await expect(page.getByLabel('Texto a imprimir')).toHaveValue('Não perder esta personalização');
 await page.unroute('**/api/cart');await page.getByRole('button',{name:'Adicionar ao carrinho →'}).click();await expect(page.getByRole('link',{name:'Ver carrinho e continuar →'})).toBeVisible();
});
