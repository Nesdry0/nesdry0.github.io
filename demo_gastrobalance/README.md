# Demo GastroBalance

Demo funcional e independiente de GastroBalance. No usa PostgreSQL ni Supabase: los datos se cargan en memoria para que puedas probar el flujo rapidamente.

## Ejecutar

Desde la carpeta `demo_gastrobalance`:

```powershell
python -m pip install -r requirements.txt
streamlit run app.py
```

La aplicacion abre normalmente en `http://localhost:8501`.

## Incluye

- Resumen semanal de ventas, utilidad e inventario.
- Editor de inventario y formulario para agregar ingredientes.
- Tabla de recetas con costo y margen por plato.
- Calculadora de punto de equilibrio.
- Reparto de utilidad: 50% sueldos, 20% ahorro y 30% otros costos.

Los cambios no se guardan al cerrar la aplicacion. Es una base visual y funcional para integrar despues con la app principal y una base de datos.
