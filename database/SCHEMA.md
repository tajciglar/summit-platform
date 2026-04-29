# Database Schema Index

Visual map of every table and how they connect. Grouped by bounded context.
All IDs are `uuid` unless noted. Diagrams use Mermaid ER syntax — arrows point
**from child → parent** (the side that holds the FK points at the side it references).

---

## 1. Big picture

How the contexts fan out from `domains → summits → funnels`:

```mermaid
flowchart LR
    Identity[Identity<br/>users · roles · permissions]
    Tenant[Multi-tenant<br/>domains]
    Catalog[Catalog<br/>summits · speakers · products]
    Funnel[Funnel<br/>funnels · steps · bumps]
    Landing[Landing pages<br/>batches · drafts]
    Commerce[Commerce<br/>orders · refunds · coupons · payment_events]
    Affiliate[Affiliates<br/>affiliates · referrals · commissions]
    Analytics[Analytics<br/>visitor_sessions · page_views · optins · contacts]
    Media[Media<br/>media_items · attachments · spatie media]

    Identity --> Tenant
    Tenant --> Catalog
    Catalog --> Funnel
    Funnel --> Landing
    Funnel --> Commerce
    Funnel --> Analytics
    Commerce --> Affiliate
    Analytics --> Commerce
    Catalog -.attaches.-> Media
    Funnel -.attaches.-> Media
```

---

## 2. Identity & access

```mermaid
erDiagram
    users ||--o{ sessions : has
    users ||--o{ model_has_roles : "polymorphic"
    users ||--o{ model_has_permissions : "polymorphic"
    roles ||--o{ model_has_roles : assigned
    roles ||--o{ role_has_permissions : grants
    permissions ||--o{ role_has_permissions : on
    permissions ||--o{ model_has_permissions : on

    users {
        uuid id PK
        string email
        user_role role
        string stripe_customer_id
        string activecampaign_id
        string app_authentication_secret "2FA"
    }
    roles { bigint id PK string name }
    permissions { bigint id PK string name }
```

Spatie polymorphic pivots key off `model_type` + `model_id` (uuid).

---

## 3. Multi-tenant: domains

```mermaid
erDiagram
    domains ||--o{ domain_user : "operators"
    users   ||--o{ domain_user : "members"
    domains ||--o{ summits : hosts
    domains {
        uuid id PK
        string hostname
        string slug
        string brand_color
        string meta_pixel_id
        bool is_active
    }
    domain_user {
        uuid user_id FK
        uuid domain_id FK
    }
```

A summit belongs to **exactly one** domain (`summits.domain_id`).

---

## 4. Catalog: summits, speakers, products

```mermaid
erDiagram
    domains   ||--o{ summits          : owns
    summits   ||--o{ speaker_summit   : "M2M pivot"
    speakers  ||--o{ speaker_summit   : appears_in
    summits   ||--o{ product_summit   : "M2M pivot"
    products  ||--o{ product_summit   : sold_in

    summits {
        uuid id PK
        uuid domain_id FK
        string slug
        summit_status status
        summit_phase current_phase
        timestamp pre_summit_starts_at
        timestamp during_summit_starts_at
        timestamp post_summit_starts_at
        timestamp ends_at
    }
    speakers {
        uuid id PK
        string slug
        string photo_url
        text masterclass_description
        text free_video_url
        text vip_video_url
    }
    speaker_summit {
        uuid speaker_id FK
        uuid summit_id FK
        smallint day_number
        int sort_order
        string masterclass_title
        string talk_title
    }
    products {
        uuid id PK
        product_kind kind "main|bump|upsell"
        product_type product_type
        billing_interval billing_interval
        bool grants_vip_access
        int price_pre_summit_cents
        int price_during_cents
        int price_post_summit_cents
        jsonb bundled_product_ids
        int combo_discount_cents
        string stripe_product_id
        string stripe_sync_status
    }
    product_summit {
        uuid product_id FK
        uuid summit_id FK
        bool is_featured
    }
```

Speakers and products are now **global**; their attachment to a summit lives
in the pivot tables.

---

## 5. Funnels: funnels → steps → bumps → revisions

```mermaid
erDiagram
    summits        ||--o{ funnels                : has
    funnels        ||--o{ funnel_steps           : has
    funnel_steps   ||--o{ funnel_step_bumps      : offers
    products       ||--o{ funnel_step_bumps      : "as bump"
    products       ||--o{ funnel_steps           : "primary product"
    funnel_steps   ||--o{ funnel_step_revisions  : versioned
    users          ||--o{ funnel_step_revisions  : published_by

    funnels {
        uuid id PK
        uuid summit_id FK
        string slug
        summit_phase target_phase
        string template_key
        jsonb section_config
        string wp_checkout_redirect_url
        string wp_thankyou_redirect_url
        string ac_optin_tag
    }
    funnel_steps {
        uuid id PK
        uuid funnel_id FK
        uuid product_id FK
        funnel_step_type step_type
        string slug
        jsonb page_content
        json page_overrides
        bool is_published
    }
    funnel_step_bumps {
        uuid funnel_step_id FK
        uuid product_id FK
        string headline
        jsonb bullets
    }
    funnel_step_revisions {
        uuid funnel_step_id FK
        jsonb page_content_snapshot
        timestamp published_at
        uuid published_by FK
    }
```

---

## 6. Landing page generator: batches → drafts

```mermaid
erDiagram
    summits           ||--o{ landing_page_batches : "scoped to"
    funnels           ||--o{ landing_page_batches : "for funnel"
    funnel_steps      ||--o{ landing_page_batches : "for step"
    users             ||--o{ landing_page_batches : published_by
    landing_page_batches ||--o{ landing_page_drafts : produces

    landing_page_batches {
        uuid id PK
        uuid summit_id FK
        uuid funnel_id FK
        uuid funnel_step_id FK
        smallint version_count
        string status
        text style_reference_url
        jsonb template_pool
        json versions_per_template
        bool auto_publish
        uuid published_by_user_id FK
    }
    landing_page_drafts {
        uuid id PK
        uuid batch_id FK
        smallint version_number
        jsonb blocks
        jsonb sections
        text published_html
        jsonb published_hydration_manifest
        string template_key
        jsonb enabled_sections
        int token_count
        int generation_ms
    }
```

---

## 7. Commerce: orders, payments, refunds, coupons

```mermaid
erDiagram
    contacts          ||--o{ orders         : buyer
    users             ||--o{ orders         : "registered buyer"
    summits           ||--o{ orders         : on
    funnels           ||--o{ orders         : via
    funnel_steps      ||--o{ orders         : via
    visitor_sessions  ||--o{ orders         : attributed
    coupons           ||--o{ orders         : applied
    affiliates        ||--o{ orders         : credited
    orders            ||--o{ payment_events : webhooks
    orders            ||--o{ refunds        : refunded
    users             ||--o{ refunds        : refunded_by
    summits           ||--o{ coupons        : scope
    products          ||--o{ coupons        : scope

    orders {
        uuid id PK
        string order_number
        uuid contact_id FK
        uuid user_id FK
        uuid summit_id FK
        uuid funnel_id FK
        uuid funnel_step_id FK
        uuid visitor_session_id FK
        uuid coupon_id FK
        uuid affiliate_id FK
        order_status status
        summit_phase phase_at_purchase
        int subtotal_cents
        int discount_cents
        int total_cents
        jsonb items "line items snapshot"
        string stripe_payment_intent_id
        string stripe_checkout_session_id
        string stripe_subscription_id
    }
    payment_events {
        uuid id PK
        uuid order_id FK
        string stripe_event_id
        string event_type
        jsonb payload
    }
    refunds {
        uuid id PK
        uuid order_id FK
        int amount_cents
        refund_reason reason
        string stripe_refund_id
    }
    coupons {
        uuid id PK
        string code
        coupon_type coupon_type
        int amount
        uuid summit_id FK
        uuid product_id FK
        int max_uses
        int times_used
    }
```

Order line items are denormalized into `orders.items` (jsonb) at purchase time.

---

## 8. Affiliates

```mermaid
erDiagram
    users                ||--o{ affiliates             : "may be"
    affiliates           ||--o{ affiliate_referrals    : tracks
    affiliates           ||--o{ affiliate_commissions  : earns
    visitor_sessions     ||--o{ affiliate_referrals    : "session attribution"
    orders               ||--o{ affiliate_commissions  : "from order"

    affiliates {
        uuid id PK
        uuid user_id FK
        string code
        numeric commission_rate
        bool is_active
    }
    affiliate_referrals {
        uuid affiliate_id FK
        uuid visitor_session_id FK
        text landing_url
        inet ip_address
    }
    affiliate_commissions {
        uuid affiliate_id FK
        uuid order_id FK
        commission_status status
        int order_amount_cents
        int commission_cents
        timestamp paid_at
    }
```

---

## 9. Analytics: sessions, pageviews, optins, contacts

```mermaid
erDiagram
    contacts          ||--o{ optins        : "captured as"
    users             ||--o{ visitor_sessions : "if known"
    visitor_sessions  ||--o{ page_views    : in
    visitor_sessions  ||--o{ orders        : "see Commerce"
    summits           ||--o{ page_views    : on
    funnels           ||--o{ page_views    : on
    funnel_steps      ||--o{ page_views    : on
    funnels           ||--o{ optins        : on
    funnel_steps      ||--o{ optins        : on
    summits           ||--o{ optins        : on

    contacts {
        uuid id PK
        string email
        string ac_contact_id
        char country
    }
    visitor_sessions {
        uuid id PK
        uuid user_id FK
        string utm_source
        string utm_campaign
        text landing_url
        inet ip_address
        char country_code
        string device_type
    }
    page_views {
        uuid id PK
        uuid visitor_session_id FK
        uuid summit_id FK
        uuid funnel_id FK
        uuid funnel_step_id FK
        string page_type
        text page_url
    }
    optins {
        uuid id PK
        uuid contact_id FK
        uuid funnel_id FK
        uuid funnel_step_id FK
        uuid summit_id FK
        string email
        string ac_sync_status
        text ac_sync_error
        timestamp ac_synced_at
    }
```

`contacts` is the single source of truth for an email; `optins` and `orders`
both point at it.

---

## 10. Media library

Two parallel systems. Spatie `media` handles raw file storage; `media_items`
is the in-house typed library, attached polymorphically to any model.

```mermaid
erDiagram
    media_items              ||--o{ media_item_attachments : attached_to
    media_items              }o--|| users                  : created_by
    media                    }o--|| MODEL                  : "polymorphic (model_type+model_id)"
    media_item_attachments   }o--|| ATTACHABLE             : "polymorphic (attachable_type+attachable_id)"

    media_items {
        uuid id PK
        string category "hero|product|downloadable"
        string sub_category
        string disk
        string path
        string mime_type
        bigint size
        bigint legacy_spatie_media_id
        uuid created_by_user_id FK
    }
    media_item_attachments {
        uuid media_item_id FK
        uuid attachable_id "polymorphic"
        string attachable_type
        string role
        int sort_order
    }
    media {
        bigint id PK
        string model_type "polymorphic"
        uuid model_id
        string collection_name
        string disk
        bigint size
    }
```

---

## 11. Settings & infrastructure

Single-row config + framework tables — no FKs.

| Table | Purpose |
|---|---|
| `app_settings` | Singleton: company name, default currency, brand color, AC list id |
| `cache`, `cache_locks` | Laravel cache driver |
| `jobs`, `failed_jobs`, `job_batches` | Queue worker tables |
| `sessions` | Laravel session driver (`user_id` → users) |
| `password_reset_tokens` | Auth |
| `migrations` | Schema version log |

---

## 12. Foreign-key cheat sheet

Every cross-context FK in one place. Use this to trace data flow.

| From | Column | → To |
|---|---|---|
| `summits` | `domain_id` | `domains` |
| `funnels` | `summit_id` | `summits` |
| `funnel_steps` | `funnel_id` | `funnels` |
| `funnel_steps` | `product_id` | `products` |
| `funnel_step_bumps` | `funnel_step_id` | `funnel_steps` |
| `funnel_step_bumps` | `product_id` | `products` |
| `funnel_step_revisions` | `funnel_step_id` | `funnel_steps` |
| `funnel_step_revisions` | `published_by` | `users` |
| `speaker_summit` | `speaker_id`, `summit_id` | `speakers`, `summits` |
| `product_summit` | `product_id`, `summit_id` | `products`, `summits` |
| `domain_user` | `domain_id`, `user_id` | `domains`, `users` |
| `landing_page_batches` | `summit_id` / `funnel_id` / `funnel_step_id` / `published_by_user_id` | `summits` / `funnels` / `funnel_steps` / `users` |
| `landing_page_drafts` | `batch_id` | `landing_page_batches` |
| `orders` | `contact_id` | `contacts` |
| `orders` | `user_id` | `users` |
| `orders` | `summit_id` / `funnel_id` / `funnel_step_id` | catalog/funnel |
| `orders` | `visitor_session_id` | `visitor_sessions` |
| `orders` | `coupon_id` | `coupons` |
| `orders` | `affiliate_id` | `affiliates` |
| `payment_events` | `order_id` | `orders` |
| `refunds` | `order_id`, `refunded_by` | `orders`, `users` |
| `coupons` | `summit_id`, `product_id` | `summits`, `products` |
| `affiliates` | `user_id` | `users` |
| `affiliate_referrals` | `affiliate_id`, `visitor_session_id` | `affiliates`, `visitor_sessions` |
| `affiliate_commissions` | `affiliate_id`, `order_id` | `affiliates`, `orders` |
| `optins` | `contact_id` / `funnel_id` / `funnel_step_id` / `summit_id` / `user_id` | … |
| `page_views` | `visitor_session_id` / `user_id` / `summit_id` / `funnel_id` / `funnel_step_id` | … |
| `visitor_sessions` | `user_id` | `users` |
| `media_items` | `created_by_user_id` | `users` |
| `media_item_attachments` | `media_item_id` | `media_items` |
| `media`, `media_item_attachments` | `model_*` / `attachable_*` | **polymorphic** |

---

## 13. Enums

Postgres enum types live in migration `2026_04_17_100000_create_v2_enums.php`
and friends:

- `summit_status`, `summit_phase`
- `funnel_step_type`
- `product_type`, `product_kind`, `billing_interval`
- `order_status`, `coupon_type`, `commission_status`, `refund_reason`
- `user_role`
