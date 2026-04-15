--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Homebrew)
-- Dumped by pg_dump version 16.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: billing_interval; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.billing_interval AS ENUM (
    'month',
    'year'
);


--
-- Name: campaign_activity_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.campaign_activity_type AS ENUM (
    'promo',
    'peak_promo',
    'event',
    'book_speakers',
    'interviews',
    'testing',
    'replay',
    'custom'
);


--
-- Name: checklist_item_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.checklist_item_status AS ENUM (
    'not_started',
    'in_progress',
    'done',
    'not_applicable'
);


--
-- Name: commission_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.commission_status AS ENUM (
    'pending',
    'approved',
    'paid',
    'rejected'
);


--
-- Name: coupon_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.coupon_type AS ENUM (
    'percentage',
    'fixed_amount'
);


--
-- Name: funnel_step_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.funnel_step_type AS ENUM (
    'optin',
    'sales_page',
    'checkout',
    'upsell',
    'downsell',
    'thank_you'
);


--
-- Name: order_item_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_item_type AS ENUM (
    'primary',
    'bump',
    'upsell',
    'downsell'
);


--
-- Name: order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'completed',
    'refunded',
    'partially_refunded',
    'failed'
);


--
-- Name: product_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.product_type AS ENUM (
    'one_time',
    'subscription'
);


--
-- Name: refund_reason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.refund_reason AS ENUM (
    'requested',
    'duplicate',
    'fraudulent',
    'product_issue',
    'other'
);


--
-- Name: summit_phase; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.summit_phase AS ENUM (
    'pre_summit',
    'late_pre_summit',
    'during_summit',
    'post_summit'
);


--
-- Name: summit_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.summit_status AS ENUM (
    'draft',
    'published',
    'archived'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: affiliate_commissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_commissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    affiliate_id uuid NOT NULL,
    order_id uuid NOT NULL,
    order_item_id uuid,
    commission_rate numeric(5,4) NOT NULL,
    order_amount_cents integer NOT NULL,
    commission_cents integer NOT NULL,
    status public.commission_status DEFAULT 'pending'::public.commission_status NOT NULL,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: affiliate_referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_referrals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    affiliate_id uuid NOT NULL,
    session_id character varying(255),
    landing_url text,
    ip_address inet,
    user_agent text,
    utm_source character varying(255),
    utm_medium character varying(255),
    utm_campaign character varying(255),
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: affiliates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id bigint,
    code character varying(100) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    company character varying(255),
    commission_rate numeric(5,4) DEFAULT 0.3 NOT NULL,
    payment_email character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) with time zone,
    updated_at timestamp(0) with time zone
);


--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration bigint NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration bigint NOT NULL
);


--
-- Name: checklist_template_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checklist_template_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    category character varying(100) NOT NULL,
    name character varying(500) NOT NULL,
    page_type character varying(100),
    sort_order integer DEFAULT 0 NOT NULL,
    default_tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: content_access_grants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_access_grants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id bigint NOT NULL,
    summit_id uuid NOT NULL,
    access_level character varying(50) DEFAULT 'free'::character varying NOT NULL,
    order_id uuid,
    subscription_id uuid,
    granted_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(0) with time zone
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(100) NOT NULL,
    coupon_type public.coupon_type NOT NULL,
    amount integer NOT NULL,
    max_uses integer,
    times_used integer DEFAULT 0 NOT NULL,
    summit_id uuid,
    product_id uuid,
    starts_at timestamp with time zone,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: funnel_generations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.funnel_generations (
    id bigint NOT NULL,
    summit_id uuid NOT NULL,
    funnel_id uuid,
    status character varying(255) DEFAULT 'queued'::character varying NOT NULL,
    progress smallint DEFAULT '0'::smallint NOT NULL,
    current_step character varying(255),
    brief json NOT NULL,
    architect_output json,
    error_message text,
    started_at timestamp(0) without time zone,
    completed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: funnel_generations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.funnel_generations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: funnel_generations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.funnel_generations_id_seq OWNED BY public.funnel_generations.id;


--
-- Name: funnel_step_bumps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.funnel_step_bumps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    funnel_step_id uuid NOT NULL,
    product_id uuid NOT NULL,
    headline character varying(500),
    description text,
    bullets jsonb DEFAULT '[]'::jsonb NOT NULL,
    checkbox_label character varying(255),
    image_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: funnel_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.funnel_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    funnel_id uuid NOT NULL,
    step_type public.funnel_step_type NOT NULL,
    template character varying(50) DEFAULT 'default'::character varying NOT NULL,
    slug character varying(255) NOT NULL,
    name character varying(500) NOT NULL,
    content jsonb DEFAULT '{}'::jsonb NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    product_id uuid,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: funnels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.funnels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    summit_id uuid NOT NULL,
    slug character varying(255) NOT NULL,
    name character varying(500) NOT NULL,
    description text,
    target_phase public.summit_phase,
    is_active boolean DEFAULT true NOT NULL,
    theme jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: landing_page_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.landing_page_batches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    summit_id uuid NOT NULL,
    funnel_id uuid,
    version_count smallint DEFAULT 3 NOT NULL,
    status character varying(50) DEFAULT 'queued'::character varying NOT NULL,
    notes text,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    options jsonb DEFAULT '{}'::jsonb NOT NULL,
    style_reference text
);


--
-- Name: landing_page_drafts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.landing_page_drafts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    batch_id uuid NOT NULL,
    version_number smallint NOT NULL,
    blocks jsonb,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    preview_token character varying(64) NOT NULL,
    error_message character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media (
    id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL,
    uuid uuid,
    collection_name character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    file_name character varying(255) NOT NULL,
    mime_type character varying(255),
    disk character varying(255) NOT NULL,
    conversions_disk character varying(255),
    size bigint NOT NULL,
    manipulations json NOT NULL,
    custom_properties json NOT NULL,
    generated_conversions json NOT NULL,
    responsive_images json NOT NULL,
    order_column integer,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.media_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: model_has_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_has_permissions (
    permission_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


--
-- Name: model_has_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_has_roles (
    role_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


--
-- Name: optin_weekly_targets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.optin_weekly_targets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    year smallint NOT NULL,
    week_number smallint NOT NULL,
    week_start_date date NOT NULL,
    weekly_optins_target integer DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: optins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.optins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id bigint,
    email character varying(255) NOT NULL,
    first_name character varying(255),
    summit_id uuid,
    funnel_id uuid,
    funnel_step_id uuid,
    source_url text,
    ip_address inet,
    user_agent text,
    utm_source character varying(255),
    utm_medium character varying(255),
    utm_campaign character varying(255),
    utm_content character varying(255),
    utm_term character varying(255),
    activecampaign_synced boolean DEFAULT false NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    item_type public.order_item_type DEFAULT 'primary'::public.order_item_type NOT NULL,
    product_name character varying(500) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price_cents integer NOT NULL,
    total_cents integer NOT NULL,
    stripe_price_id character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number character varying(50) NOT NULL,
    user_id bigint NOT NULL,
    summit_id uuid,
    funnel_id uuid,
    funnel_step_id uuid,
    summit_phase_at_purchase public.summit_phase,
    status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    subtotal_cents integer DEFAULT 0 NOT NULL,
    discount_cents integer DEFAULT 0 NOT NULL,
    total_cents integer DEFAULT 0 NOT NULL,
    currency character(3) DEFAULT 'USD'::bpchar NOT NULL,
    coupon_id uuid,
    stripe_payment_intent_id character varying(255),
    stripe_checkout_session_id character varying(255),
    affiliate_id uuid,
    ip_address inet,
    user_agent text,
    utm_source character varying(255),
    utm_medium character varying(255),
    utm_campaign character varying(255),
    utm_content character varying(255),
    utm_term character varying(255),
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: page_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id character varying(255),
    user_id bigint,
    page_url text NOT NULL,
    page_type character varying(50),
    summit_id uuid,
    funnel_id uuid,
    funnel_step_id uuid,
    referrer_url text,
    utm_source character varying(255),
    utm_medium character varying(255),
    utm_campaign character varying(255),
    utm_content character varying(255),
    utm_term character varying(255),
    ip_address inet,
    user_agent text,
    country_code character(2),
    device_type character varying(20),
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid,
    slug character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: product_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_prices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    summit_phase public.summit_phase NOT NULL,
    amount_cents integer NOT NULL,
    compare_at_cents integer,
    stripe_price_id character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    summit_id uuid,
    category_id uuid,
    slug character varying(255) NOT NULL,
    name character varying(500) NOT NULL,
    description text,
    product_type public.product_type DEFAULT 'one_time'::public.product_type NOT NULL,
    billing_interval public.billing_interval,
    billing_interval_count integer DEFAULT 1,
    tier character varying(100),
    grants_vip_access boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    stripe_product_id character varying(255),
    intro_price_cents integer,
    intro_period_months integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    activecampaign_tag_id character varying(255)
);


--
-- Name: refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refunds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    amount_cents integer NOT NULL,
    reason public.refund_reason DEFAULT 'requested'::public.refund_reason NOT NULL,
    reason_detail text,
    stripe_refund_id character varying(255),
    refunded_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: role_has_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_has_permissions (
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: speakers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.speakers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255),
    photo_url text,
    title character varying(500),
    short_description text,
    long_description text,
    website_url text,
    social_links jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(0) with time zone,
    updated_at timestamp(0) with time zone
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id bigint NOT NULL,
    product_id uuid NOT NULL,
    order_id uuid NOT NULL,
    stripe_subscription_id character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    current_period_start timestamp(0) with time zone,
    current_period_end timestamp(0) with time zone,
    canceled_at timestamp(0) with time zone,
    created_at timestamp(0) with time zone,
    updated_at timestamp(0) with time zone
);


--
-- Name: summit_campaign_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.summit_campaign_activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    summit_id uuid NOT NULL,
    activity_type public.campaign_activity_type NOT NULL,
    label character varying(255),
    starts_at date NOT NULL,
    ends_at date NOT NULL,
    color character varying(7),
    sort_order integer DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: summit_checklist_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.summit_checklist_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    summit_id uuid NOT NULL,
    template_item_id uuid,
    category character varying(100) NOT NULL,
    name character varying(500) NOT NULL,
    page_type character varying(100),
    status public.checklist_item_status DEFAULT 'not_started'::public.checklist_item_status NOT NULL,
    link_url text,
    content_link text,
    tags_wp jsonb DEFAULT '[]'::jsonb NOT NULL,
    tags_ac jsonb DEFAULT '[]'::jsonb NOT NULL,
    circle_access boolean DEFAULT false NOT NULL,
    welcome_survey boolean DEFAULT false NOT NULL,
    price_tier_cents integer,
    sort_order integer DEFAULT 0 NOT NULL,
    comments text,
    assigned_to bigint,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: summit_checklist_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.summit_checklist_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: summit_daily_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.summit_daily_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    summit_id uuid NOT NULL,
    report_date date NOT NULL,
    views integer,
    optins integer,
    nr_of_purchases integer,
    revenue_usd_cents integer,
    revenue_eur_cents integer,
    ad_spend_eur_cents integer,
    cpc_eur_cents integer,
    optin_rate numeric(8,4),
    purchase_rate numeric(8,4),
    cpl_eur_cents integer,
    cpo_eur_cents integer,
    aov_usd_cents integer,
    roas numeric(8,4),
    checkout_rate numeric(8,4),
    upgrade_checkout_rate numeric(8,4),
    upsell_take_rate numeric(8,4),
    comment text,
    execution_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: summit_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.summit_pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    summit_id uuid NOT NULL,
    slug character varying(255) NOT NULL,
    title character varying(500) NOT NULL,
    content text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp(0) with time zone,
    updated_at timestamp(0) with time zone
);


--
-- Name: summit_phase_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.summit_phase_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    summit_id uuid NOT NULL,
    phase public.summit_phase NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone
);


--
-- Name: summit_speakers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.summit_speakers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    summit_id uuid NOT NULL,
    speaker_id uuid NOT NULL,
    masterclass_title character varying(500),
    masterclass_description text,
    rating smallint,
    free_video_url text,
    vip_video_url text,
    presentation_day date,
    sort_order integer DEFAULT 0 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    free_access_window_hours integer DEFAULT 24 NOT NULL,
    created_at timestamp(0) with time zone,
    updated_at timestamp(0) with time zone,
    CONSTRAINT summit_speakers_rating_check CHECK (((rating IS NULL) OR ((rating >= 1) AND (rating <= 5))))
);


--
-- Name: summits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.summits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug character varying(255) NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    topic character varying(255),
    hero_image_url text,
    status public.summit_status DEFAULT 'draft'::public.summit_status NOT NULL,
    current_phase public.summit_phase DEFAULT 'pre_summit'::public.summit_phase NOT NULL,
    timezone character varying(100) DEFAULT 'America/New_York'::character varying NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    summit_type character varying(20) DEFAULT 'new'::character varying NOT NULL
);


--
-- Name: timeline_annotations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timeline_annotations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    label character varying(500) NOT NULL,
    annotation_type character varying(50) DEFAULT 'note'::character varying NOT NULL,
    color character varying(7),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    first_name character varying(255),
    last_name character varying(255),
    role character varying(20) DEFAULT 'buyer'::character varying NOT NULL,
    stripe_customer_id character varying(255),
    activecampaign_id character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp(0) with time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: video_view_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_view_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id bigint NOT NULL,
    summit_speaker_id uuid NOT NULL,
    started_at timestamp(0) with time zone NOT NULL,
    expires_at timestamp(0) with time zone NOT NULL,
    last_heartbeat_at timestamp(0) with time zone
);


--
-- Name: video_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id character varying(255),
    user_id bigint,
    summit_speaker_id uuid NOT NULL,
    video_type character varying(10) NOT NULL,
    watch_duration_secs integer,
    completed boolean DEFAULT false NOT NULL,
    ip_address inet,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: funnel_generations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_generations ALTER COLUMN id SET DEFAULT nextval('public.funnel_generations_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: affiliate_commissions affiliate_commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_commissions
    ADD CONSTRAINT affiliate_commissions_pkey PRIMARY KEY (id);


--
-- Name: affiliate_referrals affiliate_referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_referrals
    ADD CONSTRAINT affiliate_referrals_pkey PRIMARY KEY (id);


--
-- Name: affiliates affiliates_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_code_unique UNIQUE (code);


--
-- Name: affiliates affiliates_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_email_unique UNIQUE (email);


--
-- Name: affiliates affiliates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: checklist_template_items checklist_template_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_template_items
    ADD CONSTRAINT checklist_template_items_pkey PRIMARY KEY (id);


--
-- Name: content_access_grants content_access_grants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_access_grants
    ADD CONSTRAINT content_access_grants_pkey PRIMARY KEY (id);


--
-- Name: content_access_grants content_access_grants_user_id_summit_id_access_level_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_access_grants
    ADD CONSTRAINT content_access_grants_user_id_summit_id_access_level_unique UNIQUE (user_id, summit_id, access_level);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: funnel_generations funnel_generations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_generations
    ADD CONSTRAINT funnel_generations_pkey PRIMARY KEY (id);


--
-- Name: funnel_step_bumps funnel_step_bumps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_step_bumps
    ADD CONSTRAINT funnel_step_bumps_pkey PRIMARY KEY (id);


--
-- Name: funnel_steps funnel_steps_funnel_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_steps
    ADD CONSTRAINT funnel_steps_funnel_id_slug_key UNIQUE (funnel_id, slug);


--
-- Name: funnel_steps funnel_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_steps
    ADD CONSTRAINT funnel_steps_pkey PRIMARY KEY (id);


--
-- Name: funnels funnels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnels
    ADD CONSTRAINT funnels_pkey PRIMARY KEY (id);


--
-- Name: funnels funnels_summit_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnels
    ADD CONSTRAINT funnels_summit_id_slug_key UNIQUE (summit_id, slug);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: landing_page_batches landing_page_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landing_page_batches
    ADD CONSTRAINT landing_page_batches_pkey PRIMARY KEY (id);


--
-- Name: landing_page_drafts landing_page_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landing_page_drafts
    ADD CONSTRAINT landing_page_drafts_pkey PRIMARY KEY (id);


--
-- Name: landing_page_drafts landing_page_drafts_preview_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landing_page_drafts
    ADD CONSTRAINT landing_page_drafts_preview_token_key UNIQUE (preview_token);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: media media_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_uuid_unique UNIQUE (uuid);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: model_has_permissions model_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_pkey PRIMARY KEY (permission_id, model_id, model_type);


--
-- Name: model_has_roles model_has_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_pkey PRIMARY KEY (role_id, model_id, model_type);


--
-- Name: optin_weekly_targets optin_weekly_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optin_weekly_targets
    ADD CONSTRAINT optin_weekly_targets_pkey PRIMARY KEY (id);


--
-- Name: optin_weekly_targets optin_weekly_targets_year_week_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optin_weekly_targets
    ADD CONSTRAINT optin_weekly_targets_year_week_number_key UNIQUE (year, week_number);


--
-- Name: optins optins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optins
    ADD CONSTRAINT optins_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: page_views page_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_views
    ADD CONSTRAINT page_views_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: permissions permissions_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_slug_key UNIQUE (slug);


--
-- Name: product_prices product_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_pkey PRIMARY KEY (id);


--
-- Name: product_prices product_prices_product_id_summit_phase_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_product_id_summit_phase_key UNIQUE (product_id, summit_phase);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_summit_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_summit_id_slug_key UNIQUE (summit_id, slug);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: role_has_permissions role_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_pkey PRIMARY KEY (permission_id, role_id);


--
-- Name: roles roles_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: speakers speakers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.speakers
    ADD CONSTRAINT speakers_pkey PRIMARY KEY (id);


--
-- Name: speakers speakers_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.speakers
    ADD CONSTRAINT speakers_slug_unique UNIQUE (slug);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_stripe_subscription_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id);


--
-- Name: summit_campaign_activities summit_campaign_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_campaign_activities
    ADD CONSTRAINT summit_campaign_activities_pkey PRIMARY KEY (id);


--
-- Name: summit_checklist_items summit_checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_checklist_items
    ADD CONSTRAINT summit_checklist_items_pkey PRIMARY KEY (id);


--
-- Name: summit_checklist_templates summit_checklist_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_checklist_templates
    ADD CONSTRAINT summit_checklist_templates_pkey PRIMARY KEY (id);


--
-- Name: summit_daily_reports summit_daily_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_daily_reports
    ADD CONSTRAINT summit_daily_reports_pkey PRIMARY KEY (id);


--
-- Name: summit_daily_reports summit_daily_reports_summit_id_report_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_daily_reports
    ADD CONSTRAINT summit_daily_reports_summit_id_report_date_key UNIQUE (summit_id, report_date);


--
-- Name: summit_pages summit_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_pages
    ADD CONSTRAINT summit_pages_pkey PRIMARY KEY (id);


--
-- Name: summit_pages summit_pages_summit_id_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_pages
    ADD CONSTRAINT summit_pages_summit_id_slug_unique UNIQUE (summit_id, slug);


--
-- Name: summit_phase_schedules summit_phase_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_phase_schedules
    ADD CONSTRAINT summit_phase_schedules_pkey PRIMARY KEY (id);


--
-- Name: summit_phase_schedules summit_phase_schedules_summit_id_phase_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_phase_schedules
    ADD CONSTRAINT summit_phase_schedules_summit_id_phase_key UNIQUE (summit_id, phase);


--
-- Name: summit_speakers summit_speakers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_speakers
    ADD CONSTRAINT summit_speakers_pkey PRIMARY KEY (id);


--
-- Name: summit_speakers summit_speakers_summit_id_speaker_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_speakers
    ADD CONSTRAINT summit_speakers_summit_id_speaker_id_unique UNIQUE (summit_id, speaker_id);


--
-- Name: summits summits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summits
    ADD CONSTRAINT summits_pkey PRIMARY KEY (id);


--
-- Name: summits summits_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summits
    ADD CONSTRAINT summits_slug_key UNIQUE (slug);


--
-- Name: timeline_annotations timeline_annotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeline_annotations
    ADD CONSTRAINT timeline_annotations_pkey PRIMARY KEY (id);


--
-- Name: landing_page_drafts uq_draft_batch_version; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landing_page_drafts
    ADD CONSTRAINT uq_draft_batch_version UNIQUE (batch_id, version_number);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: video_view_sessions video_view_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_view_sessions
    ADD CONSTRAINT video_view_sessions_pkey PRIMARY KEY (id);


--
-- Name: video_views video_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_views
    ADD CONSTRAINT video_views_pkey PRIMARY KEY (id);


--
-- Name: affiliate_commissions_affiliate_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX affiliate_commissions_affiliate_id_idx ON public.affiliate_commissions USING btree (affiliate_id);


--
-- Name: affiliate_commissions_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX affiliate_commissions_order_id_idx ON public.affiliate_commissions USING btree (order_id);


--
-- Name: affiliate_commissions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX affiliate_commissions_status_idx ON public.affiliate_commissions USING btree (status);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: content_access_grants_expires_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX content_access_grants_expires_at_index ON public.content_access_grants USING btree (expires_at);


--
-- Name: content_access_grants_summit_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX content_access_grants_summit_id_index ON public.content_access_grants USING btree (summit_id);


--
-- Name: content_access_grants_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX content_access_grants_user_id_index ON public.content_access_grants USING btree (user_id);


--
-- Name: idx_campaign_activities_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaign_activities_dates ON public.summit_campaign_activities USING btree (starts_at, ends_at);


--
-- Name: idx_campaign_activities_summit; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaign_activities_summit ON public.summit_campaign_activities USING btree (summit_id);


--
-- Name: idx_checklist_items_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checklist_items_status ON public.summit_checklist_items USING btree (status);


--
-- Name: idx_checklist_items_summit; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checklist_items_summit ON public.summit_checklist_items USING btree (summit_id);


--
-- Name: idx_daily_reports_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_reports_date ON public.summit_daily_reports USING btree (report_date);


--
-- Name: idx_daily_reports_summit; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_reports_summit ON public.summit_daily_reports USING btree (summit_id);


--
-- Name: idx_landing_page_drafts_batch; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_landing_page_drafts_batch ON public.landing_page_drafts USING btree (batch_id);


--
-- Name: idx_optin_targets_week_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_optin_targets_week_start ON public.optin_weekly_targets USING btree (week_start_date);


--
-- Name: idx_template_items_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_template_items_template ON public.checklist_template_items USING btree (template_id);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: media_model_type_model_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_model_type_model_id_index ON public.media USING btree (model_type, model_id);


--
-- Name: media_order_column_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_order_column_index ON public.media USING btree (order_column);


--
-- Name: model_has_permissions_model_id_model_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_has_permissions_model_id_model_type_index ON public.model_has_permissions USING btree (model_id, model_type);


--
-- Name: model_has_roles_model_id_model_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_has_roles_model_id_model_type_index ON public.model_has_roles USING btree (model_id, model_type);


--
-- Name: optins_ac_unsynced; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX optins_ac_unsynced ON public.optins USING btree (activecampaign_synced) WHERE (NOT activecampaign_synced);


--
-- Name: optins_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX optins_created_at_index ON public.optins USING btree (created_at);


--
-- Name: optins_email_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX optins_email_index ON public.optins USING btree (email);


--
-- Name: optins_funnel_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX optins_funnel_id_index ON public.optins USING btree (funnel_id);


--
-- Name: optins_summit_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX optins_summit_id_index ON public.optins USING btree (summit_id);


--
-- Name: optins_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX optins_user_id_index ON public.optins USING btree (user_id);


--
-- Name: order_items_item_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_item_type_idx ON public.order_items USING btree (item_type);


--
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- Name: order_items_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_product_id_idx ON public.order_items USING btree (product_id);


--
-- Name: orders_affiliate_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_affiliate_id_index ON public.orders USING btree (affiliate_id);


--
-- Name: orders_completed_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_completed_at_idx ON public.orders USING btree (completed_at);


--
-- Name: orders_funnel_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_funnel_id_idx ON public.orders USING btree (funnel_id);


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: orders_stripe_pi_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_stripe_pi_idx ON public.orders USING btree (stripe_payment_intent_id);


--
-- Name: orders_summit_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_summit_id_idx ON public.orders USING btree (summit_id);


--
-- Name: orders_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_user_id_idx ON public.orders USING btree (user_id);


--
-- Name: orders_utm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_utm_idx ON public.orders USING btree (utm_source, utm_campaign);


--
-- Name: page_views_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_views_created_at_index ON public.page_views USING btree (created_at);


--
-- Name: page_views_funnel_step_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_views_funnel_step_id_index ON public.page_views USING btree (funnel_step_id);


--
-- Name: page_views_session_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_views_session_id_index ON public.page_views USING btree (session_id);


--
-- Name: page_views_summit_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_views_summit_id_index ON public.page_views USING btree (summit_id);


--
-- Name: page_views_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_views_user_id_index ON public.page_views USING btree (user_id);


--
-- Name: page_views_utm_source_utm_campaign_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_views_utm_source_utm_campaign_index ON public.page_views USING btree (utm_source, utm_campaign);


--
-- Name: product_prices_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_prices_product_id_idx ON public.product_prices USING btree (product_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: subscriptions_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscriptions_status_index ON public.subscriptions USING btree (status);


--
-- Name: subscriptions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscriptions_user_id_index ON public.subscriptions USING btree (user_id);


--
-- Name: video_views_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX video_views_created_at_index ON public.video_views USING btree (created_at);


--
-- Name: video_views_summit_speaker_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX video_views_summit_speaker_id_index ON public.video_views USING btree (summit_speaker_id);


--
-- Name: video_views_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX video_views_user_id_index ON public.video_views USING btree (user_id);


--
-- Name: affiliate_commissions affiliate_commissions_affiliate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_commissions
    ADD CONSTRAINT affiliate_commissions_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id);


--
-- Name: affiliate_commissions affiliate_commissions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_commissions
    ADD CONSTRAINT affiliate_commissions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: affiliate_commissions affiliate_commissions_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_commissions
    ADD CONSTRAINT affiliate_commissions_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE SET NULL;


--
-- Name: affiliate_referrals affiliate_referrals_affiliate_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_referrals
    ADD CONSTRAINT affiliate_referrals_affiliate_id_foreign FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id);


--
-- Name: affiliates affiliates_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: checklist_template_items checklist_template_items_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_template_items
    ADD CONSTRAINT checklist_template_items_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.summit_checklist_templates(id) ON DELETE CASCADE;


--
-- Name: content_access_grants content_access_grants_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_access_grants
    ADD CONSTRAINT content_access_grants_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: content_access_grants content_access_grants_subscription_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_access_grants
    ADD CONSTRAINT content_access_grants_subscription_id_foreign FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--
-- Name: content_access_grants content_access_grants_summit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_access_grants
    ADD CONSTRAINT content_access_grants_summit_id_foreign FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE CASCADE;


--
-- Name: content_access_grants content_access_grants_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_access_grants
    ADD CONSTRAINT content_access_grants_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: coupons coupons_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: coupons coupons_summit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_summit_id_fkey FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE SET NULL;


--
-- Name: funnel_generations funnel_generations_funnel_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_generations
    ADD CONSTRAINT funnel_generations_funnel_id_foreign FOREIGN KEY (funnel_id) REFERENCES public.funnels(id) ON DELETE SET NULL;


--
-- Name: funnel_generations funnel_generations_summit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_generations
    ADD CONSTRAINT funnel_generations_summit_id_foreign FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE CASCADE;


--
-- Name: funnel_step_bumps funnel_step_bumps_funnel_step_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_step_bumps
    ADD CONSTRAINT funnel_step_bumps_funnel_step_id_foreign FOREIGN KEY (funnel_step_id) REFERENCES public.funnel_steps(id) ON DELETE CASCADE;


--
-- Name: funnel_step_bumps funnel_step_bumps_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_step_bumps
    ADD CONSTRAINT funnel_step_bumps_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: funnel_steps funnel_steps_funnel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_steps
    ADD CONSTRAINT funnel_steps_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES public.funnels(id) ON DELETE CASCADE;


--
-- Name: funnel_steps funnel_steps_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_steps
    ADD CONSTRAINT funnel_steps_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: funnels funnels_summit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnels
    ADD CONSTRAINT funnels_summit_id_fkey FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE CASCADE;


--
-- Name: landing_page_batches landing_page_batches_funnel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landing_page_batches
    ADD CONSTRAINT landing_page_batches_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES public.funnels(id) ON DELETE SET NULL;


--
-- Name: landing_page_batches landing_page_batches_summit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landing_page_batches
    ADD CONSTRAINT landing_page_batches_summit_id_fkey FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE CASCADE;


--
-- Name: landing_page_drafts landing_page_drafts_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landing_page_drafts
    ADD CONSTRAINT landing_page_drafts_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.landing_page_batches(id) ON DELETE CASCADE;


--
-- Name: model_has_permissions model_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: model_has_roles model_has_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: optins optins_funnel_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optins
    ADD CONSTRAINT optins_funnel_id_foreign FOREIGN KEY (funnel_id) REFERENCES public.funnels(id) ON DELETE SET NULL;


--
-- Name: optins optins_funnel_step_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optins
    ADD CONSTRAINT optins_funnel_step_id_foreign FOREIGN KEY (funnel_step_id) REFERENCES public.funnel_steps(id) ON DELETE SET NULL;


--
-- Name: optins optins_summit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optins
    ADD CONSTRAINT optins_summit_id_foreign FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE SET NULL;


--
-- Name: optins optins_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.optins
    ADD CONSTRAINT optins_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_affiliate_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_affiliate_id_foreign FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id) ON DELETE SET NULL;


--
-- Name: orders orders_coupon_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_coupon_id_fk FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE SET NULL;


--
-- Name: orders orders_funnel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES public.funnels(id) ON DELETE SET NULL;


--
-- Name: orders orders_funnel_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_funnel_step_id_fkey FOREIGN KEY (funnel_step_id) REFERENCES public.funnel_steps(id) ON DELETE SET NULL;


--
-- Name: orders orders_summit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_summit_id_fkey FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: page_views page_views_funnel_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_views
    ADD CONSTRAINT page_views_funnel_id_foreign FOREIGN KEY (funnel_id) REFERENCES public.funnels(id) ON DELETE SET NULL;


--
-- Name: page_views page_views_funnel_step_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_views
    ADD CONSTRAINT page_views_funnel_step_id_foreign FOREIGN KEY (funnel_step_id) REFERENCES public.funnel_steps(id) ON DELETE SET NULL;


--
-- Name: page_views page_views_summit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_views
    ADD CONSTRAINT page_views_summit_id_foreign FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE SET NULL;


--
-- Name: page_views page_views_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_views
    ADD CONSTRAINT page_views_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: product_categories product_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.product_categories(id) ON DELETE SET NULL;


--
-- Name: product_prices product_prices_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON DELETE SET NULL;


--
-- Name: products products_summit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_summit_id_fkey FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE SET NULL;


--
-- Name: refunds refunds_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: refunds refunds_refunded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_refunded_by_fkey FOREIGN KEY (refunded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: role_has_permissions role_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: subscriptions subscriptions_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: subscriptions subscriptions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: summit_campaign_activities summit_campaign_activities_summit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_campaign_activities
    ADD CONSTRAINT summit_campaign_activities_summit_id_fkey FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE CASCADE;


--
-- Name: summit_checklist_items summit_checklist_items_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_checklist_items
    ADD CONSTRAINT summit_checklist_items_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: summit_checklist_items summit_checklist_items_summit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_checklist_items
    ADD CONSTRAINT summit_checklist_items_summit_id_fkey FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE CASCADE;


--
-- Name: summit_checklist_items summit_checklist_items_template_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_checklist_items
    ADD CONSTRAINT summit_checklist_items_template_item_id_fkey FOREIGN KEY (template_item_id) REFERENCES public.checklist_template_items(id) ON DELETE SET NULL;


--
-- Name: summit_daily_reports summit_daily_reports_summit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_daily_reports
    ADD CONSTRAINT summit_daily_reports_summit_id_fkey FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE CASCADE;


--
-- Name: summit_pages summit_pages_summit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_pages
    ADD CONSTRAINT summit_pages_summit_id_foreign FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE CASCADE;


--
-- Name: summit_phase_schedules summit_phase_schedules_summit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_phase_schedules
    ADD CONSTRAINT summit_phase_schedules_summit_id_fkey FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE CASCADE;


--
-- Name: summit_speakers summit_speakers_speaker_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_speakers
    ADD CONSTRAINT summit_speakers_speaker_id_foreign FOREIGN KEY (speaker_id) REFERENCES public.speakers(id) ON DELETE CASCADE;


--
-- Name: summit_speakers summit_speakers_summit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_speakers
    ADD CONSTRAINT summit_speakers_summit_id_foreign FOREIGN KEY (summit_id) REFERENCES public.summits(id) ON DELETE CASCADE;


--
-- Name: video_view_sessions video_view_sessions_summit_speaker_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_view_sessions
    ADD CONSTRAINT video_view_sessions_summit_speaker_id_foreign FOREIGN KEY (summit_speaker_id) REFERENCES public.summit_speakers(id);


--
-- Name: video_view_sessions video_view_sessions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_view_sessions
    ADD CONSTRAINT video_view_sessions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: video_views video_views_summit_speaker_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_views
    ADD CONSTRAINT video_views_summit_speaker_id_foreign FOREIGN KEY (summit_speaker_id) REFERENCES public.summit_speakers(id);


--
-- Name: video_views video_views_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_views
    ADD CONSTRAINT video_views_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Homebrew)
-- Dumped by pg_dump version 16.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2026_04_08_080002_create_media_table	1
5	2026_04_08_084024_create_permission_tables	1
6	2026_04_08_200000_create_enums	1
7	2026_04_08_200001_create_summits_tables	1
8	2026_04_08_200002_create_speakers_tables	1
9	2026_04_08_200003_create_product_tables	1
10	2026_04_08_200004_create_funnel_tables	1
11	2026_04_08_200005_update_users_table	1
12	2026_04_08_200006_create_orders_tables	1
13	2026_04_08_200007_create_content_access_tables	1
14	2026_04_08_200008_create_optins_table	1
15	2026_04_08_200009_create_analytics_tables	1
16	2026_04_08_200010_create_affiliate_tables	1
17	2026_04_08_200011_create_coupons_table	1
18	2026_04_09_000001_add_campaign_enums_and_summit_type	1
19	2026_04_09_000002_create_summit_campaign_activities_table	1
20	2026_04_09_000003_create_optin_weekly_targets_table	1
21	2026_04_09_000004_create_summit_daily_reports_table	1
22	2026_04_09_000005_create_checklist_tables	1
23	2026_04_09_100001_add_activecampaign_tag_id_to_products	2
24	2026_04_14_072422_create_funnel_generations_table	3
26	2026_04_14_200000_create_landing_page_tables	4
27	2026_04_14_210000_add_options_to_landing_page_batches	5
28	2026_04_14_210000_add_style_reference_to_landing_page_batches	6
29	2026_04_15_070000_add_options_to_landing_page_batches	7
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 29, true);


--
-- PostgreSQL database dump complete
--

