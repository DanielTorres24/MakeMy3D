import { test, expect } from '@playwright/test';

test('loja: personalização com anexo → carrinho → compra simulada → backoffice',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/catalogo');
 const first=page.locator('a[href^="/produtos/"]').first();await first.click();
 await expect(page.getByRole('button',{name:'Adicionar ao carrinho →'})).toBeVisible();
 await page.getByLabel('Texto a imprimir').fill('Peça Playwright QA');
 await page.getByLabel('Cor pretendida').fill('Laranja');await page.getByLabel('Quantidade',{exact:true}).fill('2');
 await page.getByLabel('Anexos (opcional)').setInputFiles({name:'demo.stl',mimeType:'model/stl',buffer:Buffer.from('solid demo\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid demo')});
 await expect(page.getByRole('link',{name:'demo.stl'})).toBeVisible();
 await page.getByRole('button',{name:'Adicionar ao carrinho →'}).click();await page.getByRole('link',{name:'Ver carrinho e continuar →'}).click();
 await expect(page.getByText('Peça Playwright QA',{exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Simular encomenda →'}).click();
 await page.getByLabel('Nome',{exact:true}).fill('Cliente Playwright');await page.getByLabel('Email',{exact:true}).fill('playwright@example.invalid');
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Confirmar encomenda simulada →'}).click();
 await expect(page.getByRole('heading',{name:'Encomenda simulada criada'})).toBeVisible();
 const reference=(await page.locator('strong').filter({hasText:'MM3D-'}).textContent())!;
 await page.goto('/admin');await page.getByLabel('Palavra-passe',{exact:true}).fill('qa-browser-demo');await page.getByRole('button',{name:'Entrar no backoffice'}).click();
 await page.getByRole('button',{name:'Encomendas',exact:true}).click();await page.locator('summary').filter({hasText:reference}).click();
 await expect(page.getByText('playwright@example.invalid',{exact:false})).toBeVisible();
 await page.getByRole('combobox',{name:/^Estado/}).selectOption('in-production');await page.getByLabel('Notas internas').fill('Validado no browser');
 await page.getByRole('button',{name:'Guardar estado e notas'}).click();await expect(page.locator('summary').filter({hasText:reference})).toContainText('Em produção');
 await page.screenshot({path:'work/playwright-admin-desktop.png',fullPage:true});
 await page.reload();await page.getByRole('button',{name:'Encomendas',exact:true}).click();await expect(page.locator('summary').filter({hasText:reference})).toContainText('Em produção');
 expect(errors).toEqual([]);
});

test('mobile: catálogo e formulário de orçamento sem overflow horizontal',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/catalogo');
 await expect(page.locator('main.catalog-page')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:'work/playwright-catalog-mobile.png',fullPage:true});
 await page.goto('/orcamento');await page.getByLabel('O que pretendes imprimir ou modelar?').fill('Peça de substituição demonstrativa para ensaio');
 await page.getByLabel('Nome',{exact:true}).fill('Orçamento Mobile');await page.getByLabel('Email',{exact:true}).fill('mobile@example.invalid');await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Enviar pedido de orçamento →'}).click();await expect(page.getByRole('heading',{name:'Orçamento registado'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
