from datetime import date

import pandas as pd
import streamlit as st

st.set_page_config(page_title="GastroBalance",
                   page_icon="GB", layout="wide")

UNITS = ["g", "kg", "ml", "l", "unid", "pieza"]
PACK_UNITS = ["unid", "pieza", "pack", "caja"]
SALE_CHANNELS = ["Mostrador", "Delivery propio", "App delivery"]
ALLOCATION = {"Sueldos": 50, "Ahorro": 20, "Otros costos": 30}


def money(value):
    return f"CLP $ {int(round(value)):,}".replace(",", ".")


def convert_factor(source, target):
    if source == target:
        return 1
    return {("kg", "g"): 1000, ("g", "kg"): 0.001,
            ("l", "ml"): 1000, ("ml", "l"): 0.001,
            ("pieza", "unid"): 1, ("unid", "pieza"): 1}.get((source, target), 1)


def initialise():
    if "ingredients" not in st.session_state:
        st.session_state.ingredients = [
            {"name": "Pollo", "category": "Proteinas", "purchase_unit": "kg",
                "base_unit": "g", "conversion": 1000, "stock": 8000, "price": 4200},
            {"name": "Arroz", "category": "Acompanamientos", "purchase_unit": "kg",
                "base_unit": "g", "conversion": 1000, "stock": 12000, "price": 1500},
            {"name": "Palta", "category": "Vegetales", "purchase_unit": "kg",
                "base_unit": "g", "conversion": 1000, "stock": 5000, "price": 4800},
            {"name": "Tomate", "category": "Vegetales", "purchase_unit": "kg",
                "base_unit": "g", "conversion": 1000, "stock": 7000, "price": 1800},
        ]
    if "packaging" not in st.session_state:
        st.session_state.packaging = [
            {"name": "Envase kraft", "category": "Envase",
                "unit": "unid", "stock": 110, "price": 180},
            {"name": "Tapa", "category": "Envase",
                "unit": "unid", "stock": 130, "price": 90},
        ]
    if "recipes" not in st.session_state:
        st.session_state.recipes = [
            {"name": "Bowl de pollo", "margin": 35, "sales": 34,
             "ingredients": {"Pollo": 150, "Arroz": 180, "Palta": 60, "Tomate": 50},
             "packaging": {"Envase kraft": 1, "Tapa": 1}},
            {"name": "Bowl veggie", "margin": 35, "sales": 21,
             "ingredients": {"Arroz": 200, "Palta": 80, "Tomate": 80},
             "packaging": {"Envase kraft": 1, "Tapa": 1}},
        ]
    if "fixed_costs" not in st.session_state:
        st.session_state.fixed_costs = [
            {"category": "Sueldos", "description": "Turno cocina", "amount": 260000},
            {"category": "Luz", "description": "Cuenta semanal estimada", "amount": 90000},
            {"category": "Gas", "description": "Carga de gas", "amount": 70000},
        ]
    if "sales" not in st.session_state:
        st.session_state.sales = []


def register_sale(recipe, units, sale_price, channel, delivery_cost, platform_fee, reference, notes):
    units = int(units)
    required_ingredients = []
    for name, quantity in recipe["ingredients"].items():
        item = next((item for item in st.session_state.ingredients if item["name"] == name), None)
        if item and item["stock"] < quantity * units:
            required_ingredients.append(f"{name}: faltan {quantity * units - item['stock']:.0f}")
    required_packaging = []
    for name, quantity in recipe["packaging"].items():
        item = next((item for item in st.session_state.packaging if item["name"] == name), None)
        if item and item["stock"] < quantity * units:
            required_packaging.append(f"{name}: faltan {quantity * units - item['stock']:.0f}")
    if required_ingredients or required_packaging:
        return False, "Stock insuficiente: " + " | ".join(required_ingredients + required_packaging)
    for name, quantity in recipe["ingredients"].items():
        item = next((item for item in st.session_state.ingredients if item["name"] == name), None)
        if item:
            item["stock"] -= quantity * units
    for name, quantity in recipe["packaging"].items():
        item = next((item for item in st.session_state.packaging if item["name"] == name), None)
        if item:
            item["stock"] -= quantity * units
    cost, _, _ = recipe_values(recipe)
    gross_profit = (sale_price - cost) * units
    net_profit = gross_profit - delivery_cost - platform_fee
    st.session_state.sales.append({"Fecha": str(date.today()), "Plato": recipe["name"], "Unidades": units,
                                   "Canal": channel, "Ingresos": sale_price * units, "Costo": cost * units,
                                   "Utilidad neta": net_profit, "Referencia": reference, "Notas": notes})
    return True, "Venta registrada y stock descontado correctamente."


def ingredient_cost(recipe):
    values = {item["name"]: item for item in st.session_state.ingredients}
    return sum(quantity * values[name]["price"] / values[name]["conversion"]
               for name, quantity in recipe["ingredients"].items() if name in values)


def packaging_cost(recipe):
    values = {item["name"]: item for item in st.session_state.packaging}
    return sum(quantity * values[name]["price"]
               for name, quantity in recipe["packaging"].items() if name in values)


def recipe_values(recipe):
    cost = ingredient_cost(recipe) + packaging_cost(recipe)
    price = cost / (1 - recipe["margin"] /
                    100) if recipe["margin"] < 100 else 0
    return cost, price, price - cost


def fixed_total():
    return sum(item["amount"] for item in st.session_state.fixed_costs)


initialise()

st.markdown("""
<style>
:root {
    --ink: #111318;
    --muted: #5c6472;
    --purple: #6d3fc0;
    --purple-dark: #4b238e;
    --blue: #1261a0;
    --green: #1f8a5b;
    --line: #dfe3ea;
    --surface: #ffffff;
}
.stApp { background: linear-gradient(135deg, #ffffff 0%, #f4f7fc 58%, #eaf6f0 100%); color: var(--ink); }
[data-testid="stSidebar"] { background: #111318; border-right: 1px solid #2d3440; }
[data-testid="stSidebar"] * { color: #ffffff !important; }
[data-testid="stSidebar"] [data-testid="stAlert"] { background: #242936; border-color: var(--purple); }
.block-container { padding-top: 3rem; padding-bottom: 3rem; max-width: 1500px; }
h1, h2, h3 { color: var(--ink); letter-spacing: 0; font-weight: 700; }
h1 { font-size: 2.5rem; }
p, label, [data-testid="stCaptionContainer"] { color: var(--muted); }
div[data-testid="stMetric"] { background: var(--surface); border: 1px solid var(--line); border-top: 4px solid var(--purple); padding: 1rem; border-radius: 8px; box-shadow: 0 6px 18px rgba(17,19,24,.06); }
div[data-testid="stMetric"] label { color: var(--muted); }
div[data-testid="stMetric"] [data-testid="stMetricValue"] { color: var(--ink); font-size: clamp(1.35rem, 2.2vw, 2rem); white-space: normal; overflow: visible; }
.status { background: #e7f6ee; border-left: 4px solid var(--green); padding: .8rem 1rem; border-radius: 6px; color: #145337; font-weight: 600; }
button[kind="primary"] { background: var(--purple); border-color: var(--purple); }
button[kind="primary"]:hover { background: var(--purple-dark); border-color: var(--purple-dark); }
button[kind="secondary"] { border-color: var(--blue); color: var(--blue); }
[data-baseweb="tab-list"] { gap: .35rem; border-bottom: 1px solid var(--line); }
[data-baseweb="tab"] { color: var(--muted); font-weight: 600; }
[aria-selected="true"] { color: var(--purple) !important; border-bottom-color: var(--purple) !important; }
[data-testid="stDataFrame"] { border: 1px solid var(--line); border-radius: 8px; overflow: hidden; background: var(--surface); }
div[data-testid="stAlert"] { border-radius: 6px; }
hr { border-color: var(--line); }
</style>
""", unsafe_allow_html=True)

st.sidebar.markdown("# GastroBalance")
st.sidebar.caption("Inventario, recetas, costeo y punto de equilibrio")
st.sidebar.subheader("Configuracion de la nube")
st.sidebar.info("Modo demo local: la informacion se guarda en memoria para probar el flujo sin credenciales.")
st.sidebar.caption("Replica el flujo de GastroBalance sin PostgreSQL ni Supabase.")

st.title("GastroBalance")
st.caption("Inventario, recetas, costeo y punto de equilibrio con base de datos en la nube")
st.markdown("<div class='status'>GastroBalance demo lista. Puedes editar registros y probar el flujo completo con datos de prueba.</div>", unsafe_allow_html=True)

ingredients = st.session_state.ingredients
packaging = st.session_state.packaging
recipes = st.session_state.recipes
fixed = fixed_total()
recipe_rows = []
for recipe in recipes:
    cost, price, margin = recipe_values(recipe)
    recipe_rows.append({"Plato": recipe["name"], "Costo total": cost,
                        "Precio sugerido": price, "Margen unitario": margin,
                        "Margen objetivo": recipe["margin"], "Ventas semana": recipe["sales"]})
recipe_df = pd.DataFrame(recipe_rows)

tabs = st.tabs(["Dashboard", "Inventario", "Recetas",
               "Ventas", "Finanzas", "Simulacion"])

with tabs[0]:
    st.subheader("Resumen operativo")
    selected_name = st.selectbox("Elegir plato para resumen", [
                                 item["name"] for item in recipes], key="dashboard_recipe")
    selected = next(item for item in recipes if item["name"] == selected_name)
    selected_cost, selected_price, selected_margin = recipe_values(selected)
    c1, c2, c3, c4 = st.columns(4)
    inventory_value = sum(
        item["stock"] / item["conversion"] * item["price"] for item in ingredients)
    inventory_value += sum(item["stock"] * item["price"] for item in packaging)
    c1.metric("Valor inventario", money(inventory_value))
    c2.metric("Costos fijos semanales", money(fixed))
    c3.metric("Costo plato", money(selected_cost))
    c4.metric("Precio sugerido", money(selected_price))
    st.divider()
    left, right = st.columns([1.5, 1])
    with left:
        st.subheader("Recetas activas")
        shown = recipe_df.copy()
        for column in ["Costo total", "Precio sugerido", "Margen unitario"]:
            shown[column] = shown[column].map(money)
        shown["Margen objetivo"] = shown["Margen objetivo"].map(
            lambda value: f"{value:.0f}%")
        st.dataframe(shown, hide_index=True, use_container_width=True)
    with right:
        st.subheader("Punto de equilibrio de referencia")
        units = fixed / selected_margin if selected_margin else 0
        st.metric("Unidades por semana", f"{units:,.0f}".replace(",", "."))
        st.info(
            "El precio sugerido considera el margen objetivo de la receta seleccionada.")

with tabs[1]:
    st.subheader("Ingredientes")
    st.caption("Unidades de compra, unidad base, conversion y costo actual.")
    columns = {"name": "Nombre", "category": "Categoria", "purchase_unit": "Unidad compra",
               "base_unit": "Unidad base", "conversion": "Factor conversion", "stock": "Stock base", "price": "Precio compra"}
    st.dataframe(pd.DataFrame(ingredients).rename(columns=columns),
                 hide_index=True, use_container_width=True)
    with st.form("ingredient_form"):
        a, b, c = st.columns(3)
        name = a.text_input("Nombre ingrediente")
        category = b.text_input("Categoria", value="General")
        purchase_unit = c.selectbox("Unidad de compra", UNITS)
        d, e, f = st.columns(3)
        base_unit = d.selectbox("Unidad base", UNITS)
        conversion = e.number_input("Factor conversion a base", min_value=0.000001, value=float(
            convert_factor(purchase_unit, base_unit)), step=1.0)
        price = f.number_input("Precio de compra", min_value=0.0, step=100.0)
        if st.form_submit_button("Guardar ingrediente") and name.strip():
            ingredients.append({"name": name.strip(), "category": category, "purchase_unit": purchase_unit,
                               "base_unit": base_unit, "conversion": conversion, "stock": 0.0, "price": price})
            st.success("Ingrediente guardado.")
    st.subheader("Registrar compra de ingrediente")
    purchase_name = st.selectbox(
        "Ingrediente", [item["name"] for item in ingredients], key="purchase_ingredient")
    p1, p2, p3 = st.columns(3)
    purchase_quantity = p1.number_input(
        "Cantidad comprada", min_value=0.0, value=1.0, key="purchase_quantity")
    purchase_unit = p2.selectbox(
        "Unidad compra", UNITS, index=1, key="purchase_unit")
    purchase_cost = p3.number_input(
        "Costo total compra", min_value=0.0, step=1000.0, key="purchase_cost")
    if st.button("Registrar compra", key="register_purchase"):
        item = next(
            item for item in ingredients if item["name"] == purchase_name)
        item["stock"] += purchase_quantity * \
            convert_factor(purchase_unit, item["base_unit"])
        if purchase_quantity and purchase_cost:
            item["price"] = purchase_cost / purchase_quantity
        st.success("Compra registrada y stock actualizado.")
    st.divider()
    st.subheader("Empaques")
    pack_columns = {"name": "Nombre", "category": "Categoria",
                    "unit": "Unidad", "stock": "Stock unidades", "price": "Costo unitario"}
    st.dataframe(pd.DataFrame(packaging).rename(
        columns=pack_columns), hide_index=True, use_container_width=True)
    with st.form("packaging_form"):
        a, b, c = st.columns(3)
        pack_name = a.text_input("Nombre empaque")
        pack_category = b.text_input("Categoria", value="Empaque")
        pack_unit = c.selectbox("Unidad", PACK_UNITS)
        if st.form_submit_button("Guardar empaque") and pack_name.strip():
            packaging.append({"name": pack_name.strip(
            ), "category": pack_category, "unit": pack_unit, "stock": 0.0, "price": 0.0})
            st.success("Empaque guardado.")
    pack_purchase = st.selectbox("Empaque para compra", [item["name"] for item in packaging], key="purchase_pack")
    q1, q2 = st.columns(2)
    pack_quantity = q1.number_input("Cantidad de empaques", min_value=0.0, value=1.0, key="pack_quantity")
    pack_unit_cost = q2.number_input("Costo unitario", min_value=0.0, step=10.0, key="pack_unit_cost")
    if st.button("Registrar compra de empaque", key="register_pack_purchase"):
        item = next(item for item in packaging if item["name"] == pack_purchase)
        item["stock"] += pack_quantity
        if pack_unit_cost:
            item["price"] = pack_unit_cost
        st.success("Compra de empaque registrada.")

with tabs[2]:
    st.subheader("Recetas y escandallo")
    with st.form("recipe_form"):
        a, b = st.columns(2)
        new_recipe_name = a.text_input("Nombre del plato")
        new_margin = b.number_input("Margen objetivo %", min_value=0.0, max_value=99.0, value=35.0, step=1.0)
        if st.form_submit_button("Guardar receta") and new_recipe_name.strip():
            recipes.append({"name": new_recipe_name.strip(), "margin": new_margin, "sales": 0, "ingredients": {}, "packaging": {}})
            st.success("Receta guardada.")
    recipe_name = st.selectbox(
        "Elegir receta", [item["name"] for item in recipes], key="recipe_select")
    recipe = next(item for item in recipes if item["name"] == recipe_name)
    r1, r2, r3 = st.columns(3)
    r1.metric("Costo ingredientes", money(ingredient_cost(recipe)))
    r2.metric("Costo empaques", money(packaging_cost(recipe)))
    total_cost, suggested, margin = recipe_values(recipe)
    r3.metric("Precio sugerido", money(suggested))
    st.write("**Ingredientes de la receta**")
    recipe_ing = pd.DataFrame([{"Ingrediente": name, "Cantidad base": quantity, "Unidad": next(
        (item["base_unit"] for item in ingredients if item["name"] == name), "")} for name, quantity in recipe["ingredients"].items()])
    st.dataframe(recipe_ing, hide_index=True, use_container_width=True)
    with st.form("add_recipe_ingredient"):
        i1, i2 = st.columns(2)
        ingredient_name = i1.selectbox(
            "Ingrediente", [item["name"] for item in ingredients], key="recipe_ing_select")
        quantity = i2.number_input(
            "Cantidad en unidad base", min_value=0.0, value=0.0, step=10.0)
        if st.form_submit_button("Agregar / actualizar ingrediente"):
            recipe["ingredients"][ingredient_name] = quantity
            st.success("Ingrediente actualizado en el escandallo.")
    st.write("**Empaques de la receta**")
    st.dataframe(pd.DataFrame([{"Empaque": name, "Cantidad": quantity} for name,
                 quantity in recipe["packaging"].items()]), hide_index=True, use_container_width=True)
    if packaging:
        with st.form("add_recipe_packaging"):
            p1, p2 = st.columns(2)
            recipe_pack_name = p1.selectbox("Empaque", [item["name"] for item in packaging], key="recipe_pack_select")
            recipe_pack_quantity = p2.number_input("Cantidad de piezas", min_value=0.0, value=1.0, step=1.0)
            if st.form_submit_button("Agregar / actualizar empaque"):
                recipe["packaging"][recipe_pack_name] = recipe_pack_quantity
                st.success("Empaque actualizado en el escandallo.")
    st.info(
        f"Costo total: {money(total_cost)} | Margen unitario estimado: {money(margin)}")

with tabs[3]:
    st.subheader("Punto de equilibrio semanal y distribucion de utilidades")
    selected_name = st.selectbox(
        "Receta de referencia de margen", [item["name"] for item in recipes], key="sales_break_even_recipe")
    selected = next(item for item in recipes if item["name"] == selected_name)
    selected_cost, selected_price, _ = recipe_values(selected)
    weekly_col1, weekly_col2 = st.columns(2)
    weekly_col1.date_input("Semana a analizar", value=date.today(), key="sales_week_input")
    weekly_sales = weekly_col2.number_input(
        "Ventas semanales totales (CLP)", min_value=0.0, value=1640000.0, step=10000.0)
    reference_margin = selected["margin"]
    a, b, c = st.columns(3)
    a.metric("Costo fijo semanal", money(fixed))
    b.metric("Margen de referencia", f"{reference_margin:.1f}%")
    c.metric("Precio sugerido de referencia", money(selected_price))
    st.caption(
        "Usa esta pestaña para revisar si lo vendido en la semana alcanza para cubrir los costos fijos y cuanto queda para repartir.")
    margin_pct = st.number_input(
        "Margen de contribucion promedio del negocio (%)",
        min_value=0.0, max_value=99.0, value=float(reference_margin), step=1.0)
    break_even = fixed / (margin_pct / 100) if margin_pct else 0
    result = weekly_sales * margin_pct / 100 - fixed
    break_even_units = break_even / selected_price if selected_price else 0
    k1, k2, k3 = st.columns(3)
    k1.metric("Punto de equilibrio semanal", money(break_even))
    k2.metric("Ventas de la semana", money(weekly_sales))
    k3.metric("Resultado semanal", money(result))
    if weekly_sales >= break_even and break_even > 0:
        st.success("La semana alcanzo el punto de equilibrio.")
    else:
        st.warning("La semana no alcanzo el punto de equilibrio.")
    st.write({
        "ventas_semanales": money(weekly_sales),
        "ventas_necesarias_para_equilibrio": money(break_even),
        "unidades_aproximadas_para_equilibrio": f"{break_even_units:,.0f}".replace(",", "."),
        "margen_aplicado_pct": round(float(margin_pct), 2),
        "utilidad_disponible_despues_de_fijos": money(max(result, 0)),
    })
    st.info(
        f"Para alcanzar el equilibrio necesitas vender aproximadamente {break_even_units:,.0f} unidades de {selected['name']} a {money(selected_price)} cada una.".replace(",", ".")
    )
    st.divider()
    st.subheader("Distribucion de utilidades")
    st.info("Regla fija aplicada: 100% total. La utilidad disponible se reparte automaticamente segun esta proporcion.")
    allocation = pd.DataFrame({
        "Destino": list(ALLOCATION),
        "Porcentaje": list(ALLOCATION.values()),
    })
    allocation["Monto"] = allocation["Porcentaje"] / 100 * max(result, 0)
    st.dataframe(allocation.assign(Monto=allocation["Monto"].map(
        money)), hide_index=True, use_container_width=True)
    if result <= 0:
        st.error("No hay utilidad para repartir esta semana. Primero debes superar el punto de equilibrio.")

with tabs[4]:
    st.subheader("Costos fijos semanales")
    cost_columns = {"category": "Categoria",
                    "description": "Descripcion", "amount": "Monto"}
    fixed_df = pd.DataFrame(st.session_state.fixed_costs).rename(
        columns=cost_columns)
    st.dataframe(fixed_df.assign(Monto=fixed_df["Monto"].map(
        money)), hide_index=True, use_container_width=True)
    with st.form("fixed_cost_form"):
        a, b, c = st.columns(3)
        category = a.selectbox(
            "Categoria", ["Luz", "Agua", "Gas", "Sueldos", "Otros"])
        description = b.text_input("Descripcion")
        amount = c.number_input("Monto", min_value=0.0, step=1000.0)
        if st.form_submit_button("Guardar costo fijo") and description.strip():
            st.session_state.fixed_costs.append(
                {"category": category, "description": description.strip(), "amount": amount})
            st.success("Costo fijo guardado.")
    st.metric("Total costos fijos semana", money(fixed_total()))

with tabs[5]:
    st.subheader("Simulacion de disponibilidad")
    sim_name = st.selectbox("Receta a simular", [
                            item["name"] for item in recipes], key="sim_recipe")
    sim_recipe = next(item for item in recipes if item["name"] == sim_name)
    limits = []
    ingredient_values = {item["name"]: item for item in ingredients}
    for name, quantity in sim_recipe["ingredients"].items():
        if quantity > 0 and name in ingredient_values:
            limits.append((ingredient_values[name]["stock"] / quantity, name))
    packaging_values = {item["name"]: item for item in packaging}
    for name, quantity in sim_recipe["packaging"].items():
        if quantity > 0 and name in packaging_values:
            limits.append((packaging_values[name]["stock"] / quantity, name))
    max_units, bottleneck = min(limits) if limits else (0, "Sin insumos")
    st.metric("Platos maximos preparables",
              f"{max_units:,.0f}".replace(",", "."))
    st.write(f"Insumo limitante: **{bottleneck}**")
    availability = pd.DataFrame(limits, columns=["Unidades posibles", "Insumo"]).sort_values(
        "Unidades posibles") if limits else pd.DataFrame()
    if not availability.empty:
        st.bar_chart(availability.set_index("Insumo"), color="#ef765c")
