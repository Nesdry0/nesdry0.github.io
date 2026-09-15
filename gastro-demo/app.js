const state = {
    ingredients: [
        { id: 1, name: 'Pollo', category: 'Proteínas', stock: 24, unit: 'kg', price: 4800 },
        { id: 2, name: 'Arroz', category: 'Acompañamientos', stock: 18, unit: 'kg', price: 1300 },
        { id: 3, name: 'Palta', category: 'Vegetales', stock: 12, unit: 'kg', price: 2890 },
        { id: 4, name: 'Tomate', category: 'Vegetales', stock: 16, unit: 'kg', price: 1800 },
    ],
    packaging: [
        { id: 10, name: 'Envase kraft', category: 'Envase', stock: 68, unit: 'unid', price: 180 },
        { id: 11, name: 'Tapa', category: 'Envase', stock: 82, unit: 'unid', price: 90 },
    ],
    recipes: [
        {
            id: 1,
            name: 'Bowl de pollo',
            margin: 35,
            ingredients: { Pollo: 0.15, Arroz: 0.18, Palta: 0.06, Tomate: 0.05 },
            packaging: { 'Envase kraft': 1, Tapa: 1 },
        },
        {
            id: 2,
            name: 'Bowl veggie',
            margin: 35,
            ingredients: { Arroz: 0.2, Palta: 0.08, Tomate: 0.08 },
            packaging: { 'Envase kraft': 1, Tapa: 1 },
        },
    ],
    fixedCosts: [
        { category: 'Sueldos', amount: 260000 },
        { category: 'Luz', amount: 90000 },
        { category: 'Gas', amount: 70000 },
    ],
    sales: [
        { recipe: 'Bowl de pollo', units: 12, salePrice: 7800, channel: 'Mostrador', netProfit: 132000 },
        { recipe: 'Bowl veggie', units: 8, salePrice: 7100, channel: 'Delivery propio', netProfit: 107000 },
    ],
};

const currency = (value) => `CLP $ ${Math.round(value).toLocaleString('es-CL')}`;

function ingredientCost(recipe) {
    const ingredientMap = Object.fromEntries(state.ingredients.map((item) => [item.name, item]));
    let total = 0;
    Object.entries(recipe.ingredients).forEach(([ingredientName, quantity]) => {
        const ingredient = ingredientMap[ingredientName];
        if (ingredient) {
            total += quantity * ingredient.price;
        }
    });
    return total;
}

function packagingCost(recipe) {
    const packagingMap = Object.fromEntries(state.packaging.map((item) => [item.name, item]));
    let total = 0;
    Object.entries(recipe.packaging).forEach(([name, quantity]) => {
        const item = packagingMap[name];
        if (item) {
            total += quantity * item.price;
        }
    });
    return total;
}

function recipeValues(recipe) {
    const cost = ingredientCost(recipe) + packagingCost(recipe);
    const salePrice = recipe.margin < 100 ? cost / (1 - recipe.margin / 100) : 0;
    const unitProfit = salePrice - cost;
    return { cost, salePrice, unitProfit };
}

function inventoryTotal() {
    const ingredientsValue = state.ingredients.reduce((sum, item) => sum + item.stock * item.price, 0);
    const packagingValue = state.packaging.reduce((sum, item) => sum + item.stock * item.price, 0);
    return ingredientsValue + packagingValue;
}

function fixedTotal() {
    return state.fixedCosts.reduce((sum, item) => sum + item.amount, 0);
}

function tabButtons() {
    return document.querySelectorAll('.tab');
}

function panles() {
    return document.querySelectorAll('.panel');
}

function renderTabs() {
    tabButtons().forEach((button) => {
        button.addEventListener('click', () => {
            tabButtons().forEach((tab) => tab.classList.toggle('is-active', tab === button));
            panles().forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === button.dataset.tab));
        });
    });
}

function renderDashboard() {
    const totalInventory = inventoryTotal();
    const fixed = fixedTotal();
    const mainRecipe = state.recipes[0];
    const firstValues = recipeValues(mainRecipe);
    const breakEvenUnits = fixed / firstValues.unitProfit;

    document.getElementById('dashboardMetrics').innerHTML = `
    <div class="metric-box">
      <span class="label">Valor de inventario</span>
      <span class="value">${currency(totalInventory)}</span>
    </div>
    <div class="metric-box">
      <span class="label">Costos fijos</span>
      <span class="value">${currency(fixed)}</span>
    </div>
    <div class="metric-box">
      <span class="label">Costo del plato</span>
      <span class="value">${currency(firstValues.cost)}</span>
    </div>
    <div class="metric-box">
      <span class="label">Precio sugerido</span>
      <span class="value">${currency(firstValues.salePrice)}</span>
    </div>
  `;

    document.getElementById('recipeList').innerHTML = state.recipes
        .map((recipe) => {
            const values = recipeValues(recipe);
            return `
        <div class="recipe-item">
          <div>
            <strong>${recipe.name}</strong>
            <span>Margen objetivo ${recipe.margin}%</span>
          </div>
          <div>
            <span>${currency(values.salePrice)}</span>
            <span class="tag">Utilidad ${currency(values.unitProfit)}</span>
          </div>
        </div>
      `;
        })
        .join('');

    document.getElementById('breakEvenCard').innerHTML = `
    <div class="break-even-box">
      <span class="label">Unidades para equilibrio</span>
      <strong>${Math.max(0, Math.round(breakEvenUnits)).toLocaleString('es-CL')}</strong>
      <span>Con el plato principal de referencia.</span>
    </div>
    <div class="break-even-box">
      <span class="label">Utilidad neta estimada</span>
      <strong>${currency(state.sales.reduce((sum, item) => sum + item.netProfit, 0))}</strong>
      <span>Sumando ventas simuladas del periodo.</span>
    </div>
  `;
}

function renderInventory() {
    const inventoryList = document.getElementById('inventoryList');
    const allItems = [...state.ingredients, ...state.packaging];

    inventoryList.innerHTML = allItems
        .map((item) => `
      <div class="inventory-item">
        <div>
          <strong>${item.name}</strong>
          <span>${item.category}</span>
        </div>
        <div style="text-align:right;">
          <strong>${item.stock} ${item.unit}</strong>
          <span>${currency(item.price)} / unidad</span>
        </div>
      </div>
    `)
        .join('');
}

function renderRecipes() {
    const container = document.getElementById('recipesTable');
    const header = ['Plato', 'Costo', 'Precio', 'Margen', 'Estado'];
    const rows = state.recipes.map((recipe) => {
        const values = recipeValues(recipe);
        return `
      <div class="table-row">
        <strong>${recipe.name}</strong>
        <span>${currency(values.cost)}</span>
        <span>${currency(values.salePrice)}</span>
        <span>${recipe.margin}%</span>
        <span class="tag">Listo</span>
      </div>
    `;
    });

    container.innerHTML = `
    <div class="table-row header">
      ${header.map((cell) => `<span>${cell}</span>`).join('')}
    </div>
    ${rows.join('')}
  `;
}

function renderSales() {
    const saleSelect = document.getElementById('saleRecipe');
    const salesList = document.getElementById('salesList');

    saleSelect.innerHTML = state.recipes
        .map((recipe) => `<option value="${recipe.name}">${recipe.name}</option>`)
        .join('');

    salesList.innerHTML = state.sales.length
        ? state.sales
            .map(
                (sale) => `
            <div class="sale-item">
              <div>
                <strong>${sale.recipe}</strong>
                <span>${sale.channel} · ${sale.units} uds.</span>
              </div>
              <div style="text-align:right;">
                <strong>${currency(sale.netProfit)}</strong>
                <span>${currency(sale.salePrice * sale.units)}</span>
              </div>
            </div>
          `,
            )
            .join('')
        : '<div class="sale-item"><div><strong>No hay ventas</strong><span>Registra una venta para comenzar.</span></div></div>';
}

function renderFinance() {
    const total = state.sales.reduce((sum, item) => sum + item.netProfit, 0);
    const shares = [
        { label: 'Sueldos', value: total * 0.5, color: '#5b3ec8' },
        { label: 'Ahorro', value: total * 0.2, color: '#1769aa' },
        { label: 'Otros costos', value: total * 0.3, color: '#1d8f5f' },
    ];

    const maxShare = Math.max(...shares.map((share) => share.value), 1);
    document.getElementById('financeShare').innerHTML = shares
        .map((share) => `
      <div class="share-item">
        <div>
          <strong>${share.label}</strong>
          <span>${currency(share.value)}</span>
        </div>
        <div style="width: 150px;">
          <div class="progress"><span style="width:${(share.value / maxShare) * 100}%"></span></div>
        </div>
      </div>
    `)
        .join('');
}

function updateAll() {
    renderDashboard();
    renderInventory();
    renderRecipes();
    renderSales();
    renderFinance();
}

document.getElementById('ingredientForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item = {
        id: Date.now(),
        name: form.get('name').toString().trim(),
        category: form.get('category').toString().trim(),
        stock: Number(form.get('stock')),
        unit: form.get('unit').toString(),
        price: Number(form.get('price')),
    };

    if (!item.name) return;
    state.ingredients.push(item);
    event.currentTarget.reset();
    updateAll();
});

document.getElementById('saleForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const recipeName = form.get('recipe').toString();
    const recipe = state.recipes.find((item) => item.name === recipeName);
    const units = Number(form.get('units'));
    const salePrice = Number(form.get('salePrice'));

    if (!recipe || !units || !salePrice) return;

    const values = recipeValues(recipe);
    const netProfit = (salePrice - values.cost) * units - Number(form.get('deliveryCost')) - Number(form.get('platformFee'));

    state.sales.unshift({
        recipe: recipe.name,
        units,
        salePrice,
        channel: form.get('channel').toString(),
        netProfit,
    });

    event.currentTarget.reset();
    updateAll();
});

renderTabs();
updateAll();
