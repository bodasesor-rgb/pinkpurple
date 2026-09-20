# Contrato del panel con Nexus

El panel de clientes (este repo, Netlify) **no genera contenido**: todo lo pide a Nexus.

```
Navegador ──/api/*──> Netlify Function `nexus-proxy`
                         │
                         ├─ /auth/* + /me + /usage  → Hostinger `/api/pinkpurple/*`
                         │     (cookie nexus_sid guardada como pp_at httpOnly)
                         └─ /projects|/jobs|/…      → 404 (el front cae a mocks)
```

- Variable en Netlify: `NEXUS_API_URL=https://white-ferret-567834.hostingersite.com`
- Auth real ya funciona contra Hostinger. Proyectos/jobs/conexiones siguen mock hasta
  que Nexus los implemente.
- Formato de error: `{ "error": "…", "code": "…" }`

---

## Probar registro / borrar cuenta de prueba

1. En Netlify, fija `NEXUS_API_URL` al Hostinger de arriba y redeploya.
2. Abre `/registro` en el panel y crea una cuenta (login automático tras el alta).
3. Si quieres re-registrar el mismo correo (ej. borraste “voxtoys”):

```bash
# Listar (Basic = usuario/contraseña del panel Nexus)
curl -u 'bodasesor:TU_PASS' \
  'https://white-ferret-567834.hostingersite.com/api/pinkpurple/admin/accounts?q=voxtoys'

# Borrar por texto (email, nombre o siteKey)
curl -u 'bodasesor:TU_PASS' -X DELETE \
  -H 'Content-Type: application/json' \
  -d '{"q":"voxtoys"}' \
  'https://white-ferret-567834.hostingersite.com/api/pinkpurple/admin/accounts'
```

Tras el DELETE puedes volver a `/registro` con el mismo email.

---

## 1. Autenticación (vía proxy → `/api/pinkpurple`)

| Método panel | Ruta proxy | Hostinger real |
|---|---|---|
| POST | `/auth/register` | `POST /api/pinkpurple/register` + login |
| POST | `/auth/login` | `POST /api/pinkpurple/login` |
| GET | `/auth/me` | `GET /api/pinkpurple/me` |
| POST | `/auth/logout` | `POST /api/pinkpurple/logout` |
| GET | `/usage` | derivado de `GET /me` (créditos trial) |

`user` que ve el panel:

```json
{
  "id": "…",
  "email": "cliente@dominio.com",
  "fullName": "Nombre",
  "tenantId": "pp-…",
  "planId": "trial",
  "createdAt": "…"
}
```

`forgot-password` / `reset-password` → `501` hasta que existan en Nexus.

---

## 2. Cuenta y uso del plan

| Método | Ruta | Notas |
|---|---|---|
| GET | `/me` | mapeado |
| GET | `/usage` | mapeado desde créditos trial |

---

## 3–5. Proyectos, trabajos, conexiones

**Aún no en Hostinger.** El proxy responde `404` + `NOT_IMPLEMENTED`; el cliente usa mocks
si `VITE_USE_MOCKS=true` o ante 404/501.

Contrato esperado cuando se implementen: ver historial git de este archivo o `src/api/types.ts`.

---

## 6. Facturación — pendiente

`GET /billing` → mock (`MOCK_ONLY.billing` en `client.ts`).

---

## 7. Admin Nexus (solo Hostinger, Basic Auth)

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/pinkpurple/admin/accounts?q=` | listar / buscar |
| DELETE | `/api/pinkpurple/admin/accounts` | body `{ id }` \| `{ email }` \| `{ q }` |

Despliega con `scripts/deploy-pinkpurple-panel.ps1` del repo Seo-Nexus.

---

## 8. CORS

El proxy es servidor→servidor: Nexus no necesita CORS para el panel.
