--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materials (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    unit character varying(20) NOT NULL,
    min_stock integer DEFAULT 10,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.materials OWNER TO postgres;

--
-- Name: materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.materials_id_seq OWNER TO postgres;

--
-- Name: materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materials_id_seq OWNED BY public.materials.id;


--
-- Name: menu_materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_materials (
    id integer NOT NULL,
    menu_id integer,
    material_id integer,
    quantity_needed integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menu_materials OWNER TO postgres;

--
-- Name: menu_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.menu_materials_id_seq OWNER TO postgres;

--
-- Name: menu_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_materials_id_seq OWNED BY public.menu_materials.id;


--
-- Name: menus; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menus (
    id integer NOT NULL,
    category_id integer,
    name character varying(100) NOT NULL,
    description text,
    price integer NOT NULL,
    image character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menus OWNER TO postgres;

--
-- Name: menus_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menus_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.menus_id_seq OWNER TO postgres;

--
-- Name: menus_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menus_id_seq OWNED BY public.menus.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    menu_id integer,
    menu_name character varying(100) NOT NULL,
    quantity integer NOT NULL,
    price integer NOT NULL,
    subtotal integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    customer_id integer,
    cashier_id integer,
    order_number character varying(50) NOT NULL,
    total integer NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    order_type character varying(20) DEFAULT 'customer'::character varying,
    payment_method character varying(20),
    paid_amount integer,
    change_amount integer,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_order_type_check CHECK (((order_type)::text = ANY ((ARRAY['customer'::character varying, 'cashier'::character varying])::text[]))),
    CONSTRAINT orders_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'card'::character varying, 'e-wallet'::character varying])::text[]))),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: stock_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_history (
    id integer NOT NULL,
    material_id integer,
    order_id integer,
    quantity_change integer NOT NULL,
    stock_before integer NOT NULL,
    stock_after integer NOT NULL,
    type character varying(20),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT stock_history_type_check CHECK (((type)::text = ANY ((ARRAY['in'::character varying, 'out'::character varying, 'adjustment'::character varying])::text[])))
);


ALTER TABLE public.stock_history OWNER TO postgres;

--
-- Name: stock_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stock_history_id_seq OWNER TO postgres;

--
-- Name: stock_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_history_id_seq OWNED BY public.stock_history.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'cashier'::character varying, 'customer'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: materials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials ALTER COLUMN id SET DEFAULT nextval('public.materials_id_seq'::regclass);


--
-- Name: menu_materials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_materials ALTER COLUMN id SET DEFAULT nextval('public.menu_materials_id_seq'::regclass);


--
-- Name: menus id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus ALTER COLUMN id SET DEFAULT nextval('public.menus_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: stock_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_history ALTER COLUMN id SET DEFAULT nextval('public.stock_history_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, created_at) FROM stdin;
12	Minuman	2025-10-23 05:37:53.850299
13	Mie & Dimsum	2025-10-23 05:37:53.850299
14	Nasi	2025-10-23 05:37:53.850299
15	Snack & Gorengan	2025-10-23 05:37:53.850299
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materials (id, name, stock, unit, min_stock, created_at, updated_at) FROM stdin;
76	Bubuk Kopi	1000	gram	100	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
77	Gula	2000	gram	200	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
78	Teh Celup	500	pcs	50	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
79	Air Mineral	10000	ml	1000	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
80	Susu UHT	3000	ml	300	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
81	Sirup Coklat	500	ml	50	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
82	Es Batu	5000	gram	500	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
83	Lemon	100	pcs	10	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
84	Jeruk Nipis	100	pcs	10	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
85	Vanilla	200	ml	20	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
86	Mie Kuning	5000	gram	500	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
87	Mie Lidi	3000	gram	300	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
88	Dimsum Ayam	200	pcs	20	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
89	Dimsum Udang	200	pcs	20	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
90	Ceker Ayam	1000	gram	100	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
91	Pangsit	500	pcs	50	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
92	Bakso	1000	gram	100	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
93	Cabai Rawit	500	gram	50	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
94	Bawang Putih	500	gram	50	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
95	Bawang Merah	500	gram	50	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
96	Saus Tiram	1000	ml	100	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
97	Kecap Manis	1000	ml	100	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
98	Kecap Asin	1000	ml	100	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
99	Minyak Goreng	5000	ml	500	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
100	Beras	10000	gram	1000	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
101	Ayam Fillet	3000	gram	300	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
102	Telur	200	pcs	20	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
103	Sosis	500	pcs	50	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
104	Sayuran Mix	2000	gram	200	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
105	Tahu Putih	1000	gram	100	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
106	Tempe	1000	gram	100	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
107	Pisang	500	pcs	50	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
108	Tepung Bumbu	2000	gram	200	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
109	Kentang	3000	gram	300	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
\.


--
-- Data for Name: menu_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_materials (id, menu_id, material_id, quantity_needed, created_at) FROM stdin;
18	58	78	1	2025-10-23 05:37:53.850299
19	58	79	300	2025-10-23 05:37:53.850299
20	58	82	100	2025-10-23 05:37:53.850299
21	59	78	1	2025-10-23 05:37:53.850299
22	59	77	15	2025-10-23 05:37:53.850299
23	59	79	300	2025-10-23 05:37:53.850299
24	59	82	100	2025-10-23 05:37:53.850299
25	60	84	2	2025-10-23 05:37:53.850299
26	60	77	20	2025-10-23 05:37:53.850299
27	60	79	250	2025-10-23 05:37:53.850299
28	60	82	100	2025-10-23 05:37:53.850299
29	61	78	1	2025-10-23 05:37:53.850299
30	61	83	1	2025-10-23 05:37:53.850299
31	61	77	15	2025-10-23 05:37:53.850299
32	61	79	250	2025-10-23 05:37:53.850299
33	61	82	100	2025-10-23 05:37:53.850299
34	62	76	10	2025-10-23 05:37:53.850299
35	62	79	200	2025-10-23 05:37:53.850299
36	63	76	12	2025-10-23 05:37:53.850299
37	63	80	100	2025-10-23 05:37:53.850299
38	63	77	10	2025-10-23 05:37:53.850299
39	63	79	150	2025-10-23 05:37:53.850299
40	63	82	100	2025-10-23 05:37:53.850299
41	64	81	50	2025-10-23 05:37:53.850299
42	64	80	200	2025-10-23 05:37:53.850299
43	64	77	10	2025-10-23 05:37:53.850299
44	65	76	15	2025-10-23 05:37:53.850299
45	65	80	150	2025-10-23 05:37:53.850299
46	65	77	10	2025-10-23 05:37:53.850299
47	65	79	100	2025-10-23 05:37:53.850299
48	65	82	100	2025-10-23 05:37:53.850299
49	66	86	150	2025-10-23 05:37:53.850299
50	66	94	10	2025-10-23 05:37:53.850299
51	66	95	10	2025-10-23 05:37:53.850299
52	66	96	15	2025-10-23 05:37:53.850299
53	66	97	10	2025-10-23 05:37:53.850299
54	66	104	50	2025-10-23 05:37:53.850299
55	67	86	150	2025-10-23 05:37:53.850299
56	67	93	5	2025-10-23 05:37:53.850299
57	67	94	10	2025-10-23 05:37:53.850299
58	67	95	10	2025-10-23 05:37:53.850299
59	67	96	15	2025-10-23 05:37:53.850299
60	67	97	10	2025-10-23 05:37:53.850299
61	67	104	50	2025-10-23 05:37:53.850299
62	68	86	150	2025-10-23 05:37:53.850299
63	68	93	15	2025-10-23 05:37:53.850299
64	68	94	10	2025-10-23 05:37:53.850299
65	68	95	10	2025-10-23 05:37:53.850299
66	68	96	15	2025-10-23 05:37:53.850299
67	68	97	10	2025-10-23 05:37:53.850299
68	68	104	50	2025-10-23 05:37:53.850299
69	69	86	150	2025-10-23 05:37:53.850299
70	69	93	30	2025-10-23 05:37:53.850299
71	69	94	10	2025-10-23 05:37:53.850299
72	69	95	10	2025-10-23 05:37:53.850299
73	69	96	15	2025-10-23 05:37:53.850299
74	69	97	10	2025-10-23 05:37:53.850299
75	69	104	50	2025-10-23 05:37:53.850299
76	70	88	4	2025-10-23 05:37:53.850299
77	71	89	4	2025-10-23 05:37:53.850299
78	72	91	5	2025-10-23 05:37:53.850299
79	72	99	50	2025-10-23 05:37:53.850299
80	73	90	150	2025-10-23 05:37:53.850299
81	73	93	20	2025-10-23 05:37:53.850299
82	73	94	10	2025-10-23 05:37:53.850299
83	73	97	15	2025-10-23 05:37:53.850299
84	74	92	5	2025-10-23 05:37:53.850299
85	75	100	200	2025-10-23 05:37:53.850299
86	76	100	200	2025-10-23 05:37:53.850299
87	76	102	1	2025-10-23 05:37:53.850299
88	76	94	15	2025-10-23 05:37:53.850299
89	76	95	15	2025-10-23 05:37:53.850299
90	76	97	15	2025-10-23 05:37:53.850299
91	76	104	50	2025-10-23 05:37:53.850299
92	76	99	30	2025-10-23 05:37:53.850299
93	77	100	200	2025-10-23 05:37:53.850299
94	77	101	100	2025-10-23 05:37:53.850299
95	77	102	1	2025-10-23 05:37:53.850299
96	77	94	15	2025-10-23 05:37:53.850299
97	77	95	15	2025-10-23 05:37:53.850299
98	77	97	15	2025-10-23 05:37:53.850299
99	77	104	50	2025-10-23 05:37:53.850299
100	77	99	30	2025-10-23 05:37:53.850299
101	78	100	200	2025-10-23 05:37:53.850299
102	78	103	2	2025-10-23 05:37:53.850299
103	78	102	1	2025-10-23 05:37:53.850299
104	78	94	15	2025-10-23 05:37:53.850299
105	78	95	15	2025-10-23 05:37:53.850299
106	78	97	15	2025-10-23 05:37:53.850299
107	78	104	50	2025-10-23 05:37:53.850299
108	78	99	30	2025-10-23 05:37:53.850299
109	79	105	250	2025-10-23 05:37:53.850299
110	79	108	50	2025-10-23 05:37:53.850299
111	79	99	100	2025-10-23 05:37:53.850299
112	80	106	250	2025-10-23 05:37:53.850299
113	80	108	50	2025-10-23 05:37:53.850299
114	80	99	100	2025-10-23 05:37:53.850299
115	81	107	5	2025-10-23 05:37:53.850299
116	81	108	60	2025-10-23 05:37:53.850299
117	81	77	20	2025-10-23 05:37:53.850299
118	81	99	100	2025-10-23 05:37:53.850299
119	82	109	200	2025-10-23 05:37:53.850299
120	82	108	30	2025-10-23 05:37:53.850299
121	82	99	150	2025-10-23 05:37:53.850299
\.


--
-- Data for Name: menus; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menus (id, category_id, name, description, price, image, is_active, created_at, updated_at) FROM stdin;
58	12	Es Teh Tawar	Es teh tawar segar	3000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
59	12	Es Teh Manis	Es teh manis original	5000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
60	12	Es Jeruk	Jeruk segar dengan es	8000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
61	12	Es Lemon Tea	Teh dengan perasan lemon segar	9000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
62	12	Kopi Hitam	Kopi hitam original	6000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
63	12	Es Kopi Susu	Kopi susu dingin yang creamy	10000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
64	12	Coklat Panas	Minuman coklat hangat	12000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
65	12	Es Cappuccino	Cappuccino dingin dengan foam	15000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
66	13	Mie Gacoan Lv 0	Mie original tanpa pedas	10000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
67	13	Mie Gacoan Lv 1	Mie pedas level 1 (tidak pedas)	10000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
68	13	Mie Gacoan Lv 3	Mie pedas level 3 (pedas sedang)	10000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
69	13	Mie Gacoan Lv 5	Mie pedas level 5 (sangat pedas)	10000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
70	13	Dimsum Ayam Isi 4	Dimsum ayam kukus isi 4 pcs	8000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
71	13	Dimsum Udang Isi 4	Dimsum udang kukus isi 4 pcs	10000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
72	13	Pangsit Goreng Isi 5	Pangsit goreng krispi isi 5 pcs	7000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
73	13	Ceker Mercon Lv 3	Ceker pedas level 3	12000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
74	13	Bakso Urat Isi 5	Bakso urat kenyal isi 5 pcs	12000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
75	14	Nasi Putih	Nasi putih hangat	5000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
76	14	Nasi Goreng Gacoan	Nasi goreng spesial dengan telur	15000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
77	14	Nasi Goreng Ayam	Nasi goreng dengan potongan ayam	18000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
78	14	Nasi Goreng Sosis	Nasi goreng dengan sosis	16000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
79	15	Tahu Crispy Isi 5	Tahu goreng crispy isi 5 pcs	8000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
80	15	Tempe Crispy Isi 5	Tempe goreng crispy isi 5 pcs	8000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
81	15	Pisang Crispy Isi 5	Pisang goreng crispy isi 5 pcs	10000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
82	15	Kentang Goreng	Kentang goreng crispy	12000	\N	t	2025-10-23 05:37:53.850299	2025-10-23 05:37:53.850299
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, menu_id, menu_name, quantity, price, subtotal, created_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, customer_id, cashier_id, order_number, total, status, order_type, payment_method, paid_amount, change_amount, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_history (id, material_id, order_id, quantity_change, stock_before, stock_after, type, notes, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, is_active, created_at, updated_at) FROM stdin;
3	Kasir 2	kasir2@fnb.com	password123	cashier	t	2025-10-22 13:07:26.332084	2025-10-22 13:07:26.332084
1	Admin Utama	admin@fnb.com	$2b$10$NsOkr1qfFbrDKF5X2VjNkuPO/IEjLKmLofJvy4TwvWtZ2X/lORgxS	admin	t	2025-10-22 13:07:26.332084	2025-10-22 13:07:26.332084
2	Kasir 1	kasir1@fnb.com	$2b$10$ZFQZBEQlFdBRgBxdnq5o0uMOLxoedIbe2J0gcuz9NWYXsH0td1g7G	cashier	t	2025-10-22 13:07:26.332084	2025-10-22 13:07:26.332084
4	Customer Test	customer@test.com	$2b$10$VUEHjUBp4Ku38Oj5cSeIWO85xWWWVWMwcIeA7h63zdv1/BpsN4VEG	customer	t	2025-10-22 13:07:26.332084	2025-10-22 13:07:26.332084
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 15, true);


--
-- Name: materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materials_id_seq', 109, true);


--
-- Name: menu_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_materials_id_seq', 121, true);


--
-- Name: menus_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menus_id_seq', 82, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 7, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 5, true);


--
-- Name: stock_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_history_id_seq', 11, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- Name: menu_materials menu_materials_menu_id_material_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_materials
    ADD CONSTRAINT menu_materials_menu_id_material_id_key UNIQUE (menu_id, material_id);


--
-- Name: menu_materials menu_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_materials
    ADD CONSTRAINT menu_materials_pkey PRIMARY KEY (id);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: stock_history stock_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_history
    ADD CONSTRAINT stock_history_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_menus_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menus_active ON public.menus USING btree (is_active);


--
-- Name: idx_menus_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menus_category ON public.menus USING btree (category_id);


--
-- Name: idx_orders_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created ON public.orders USING btree (created_at);


--
-- Name: idx_orders_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer ON public.orders USING btree (customer_id);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: menu_materials menu_materials_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_materials
    ADD CONSTRAINT menu_materials_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;


--
-- Name: menu_materials menu_materials_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_materials
    ADD CONSTRAINT menu_materials_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE;


--
-- Name: menus menus_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: order_items order_items_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_cashier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_cashier_id_fkey FOREIGN KEY (cashier_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: stock_history stock_history_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_history
    ADD CONSTRAINT stock_history_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;


--
-- Name: stock_history stock_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_history
    ADD CONSTRAINT stock_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

