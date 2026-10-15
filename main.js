/* =========================================================================
   Jakub Kočvara — shared script
   i18n (cs/en, remembered), header state, mobile nav, scroll reveals,
   the typing terminal and the contact form.
   ========================================================================= */
(() => {
  'use strict';

  const MAIL = 'JakubDev@outlook.com';

  const I18N = {
    cs: {
      title_home: 'Tvorba webových stránek na míru | Jakub Kočvara',
      title_about: 'O mně: volejbalista a webový vývojář | Jakub Kočvara',
      title_services: 'Tvorba webů a weby pro sportovce | Jakub Kočvara',
      title_contact: 'Kontakt a poptávka webu | Jakub Kočvara',
      title_404: 'Stránka nenalezena — Jakub Kočvara',

      skip: 'Přeskočit na obsah',
      aria_nav: 'Hlavní navigace',
      aria_foot: 'Odkazy v patičce',
      nav_home: 'Domů', nav_about: 'O mně', nav_services: 'Služby', nav_contact: 'Kontakt',
      f_note: 'postaveno ručně, řádek po řádku',

      cta_eyebrow: 'pojďme na to',
      cta_title: 'Hledáš web, který <span class="accent">vyhraje zápas</span>?',
      cta_text: 'Napiš mi pár vět o tom, co potřebuješ. Ozvu se a domluvíme se, jak na to.',
      cta_btn: 'Napsat zprávu',

      // home
      hero_eyebrow: 'Jakub Kočvara · volejbalista // vývojář',
      hl1: 'Disciplína', hl2: 'z hřiště,', hl3: 'teď psaná', hl4: 'v kódu<span class="accent">.</span>',
      f1_t: '<span>6 sezón </span><span>ve 3 zemích</span>',
      f1_p: '<span>Česká extraliga, rakouská Bundesliga </span><span>a španělská Superliga 2 — pokaždé </span><span>mezi nejlepšími bodujícími hráči.</span>',
      f2_t: '<span>Weby na míru, </span><span>bez šablon</span>',
      f2_p: '<span>Rychlé, responzivní stránky </span><span>pro sportovce, kluby i firmy. </span><span>Tahle stránka je důkaz.</span>',
      in_label: 'Weby na míru',
      in_title: 'Tvorba webových stránek pro sportovce, kluby i firmy',
      in_text: 'Jmenuju se Jakub Kočvara, jsem profesionální volejbalista a tvořím webové stránky na míru. Pracuju online pro klienty z celého Česka: sportovce, sportovní kluby, živnostníky i menší firmy. Každý web píšu ručně a bez šablon, takže je rychlý, funguje na mobilu a vyhledávače mu dobře rozumí.',
      aria_stats: 'Výsledky v číslech',
      stat1_num: '<span>2.</span> &amp; <span>3.</span>',
      stat1_label: 'Místo na MČR juniorů ve volejbale',
      stat2_label: 'Bodující hráč — Španělsko Superliga 2',
      stat3_num: '3 <span>roky</span>',
      stat3_label: 'Česká volejbalová extraliga — Volejbal Brno',
      stat4_label: 'Bodující hráč v Rakousku i Španělsku',
      band_more: 'Celá kariéra',
      home_off_label: 'Služby',
      home_off_title: 'Co pro tebe můžu udělat',
      home_off_sub: 'Jasná nabídka bez keců — tři věci, se kterými za mnou můžeš přijít.',
      off1_desc: 'Moderní web pro tebe, firmu nebo projekt. Rychlý, responzivní, bez šablon.',
      off2_desc: 'Profil hráče, trenéra nebo oddílu — výsledky, video a kontakt pro agenty i sponzory.',
      off3_desc: 'Oživení, zrychlení nebo pravidelná péče o web, který už máš.',
      home_off_more: 'Všechny služby',
      pr_label: 'Přístup',
      pr_title: 'Jak pracuju',
      pr_sub: 'Volejbal mě naučil disciplíně a opakování. Stejný přístup teď dávám do programování.',
      p1_title: '<span class="pmono">if</span> trénink == kód',
      p1_body: 'Stejně jako na hřišti — žádné zkratky, jen opakovaná práce, dokud výsledek nesedí.',
      p2_title: '<span class="pmono">for</span> každý projekt',
      p2_body: 'Beru každou stránku jako zápas — nastuduju soupeře (zadání), připravím taktiku a jdu na sto procent.',
      p3_title: '<span class="pmono">return</span> výsledek, ne výmluvy',
      p3_body: 'Tři země, tři ligy, šest sezón — naučily mě dotahovat věci do konce i pod tlakem deadlinu.',

      // about
      ab_eyebrow: 'O mně',
      ab_t1: 'Z palubovky',
      ab_t2: 'k monitoru<span class="accent">.</span>',
      ab_lead: 'Je mi 24 a na hřišti hraju jako diagonální útočník. Šest sezón jsem odehrál v ligách tří zemí — a mezitím jsem pro radost stavěl weby. Teď z toho dělám práci a beru do ní všechno, co mě naučila palubovka.',
      car_label: 'Kariéra',
      s1_title: 'Kariéra na hřišti',
      s1_sub: 'Chronologicky — odkud jsem vyrazil a kam mě to zatím zavedlo.',
      t1_year: 'Juniorská kategorie',
      t1_title: '2. a 3. místo na MČR juniorů',
      t1_desc: 'Dvakrát na stupních vítězů na mistrovství České republiky juniorů ve volejbale — jednou stříbro, jednou bronz.',
      t1_tags: '<span>ČR</span><span>junioři</span><span>volejbal</span>',
      t2_year: '3 sezóny',
      t2_title: 'Volejbal Brno — česká extraliga',
      t2_desc: 'Tři roky v nejvyšší české soutěži. Hřiště, na kterém se z nadějného juniora stává hráč, na kterého se dá spolehnout.',
      t2_tags: '<span>Extraliga ČR</span><span>3 sezóny</span>',
      t3_year: '2 sezóny',
      t3_title: 'TJ Sokol Wien — rakouská Bundesliga',
      t3_desc: 'Přesun do Rakouska a obě sezóny v top 5 bodujících hráčů ligy. Důkaz, že forma nebyla náhoda.',
      t3_tags: '<span>Bundesliga</span><span>Top 5 — obě sezóny</span>',
      t4_year: '1 sezóna',
      t4_title: 'Španělsko — Superliga 2',
      t4_desc: 'Poslední zastávka zatím: španělská Superliga 2, kde jsem skončil mezi top 3 bodujícími hráči soutěže.',
      st_label: 'Stack',
      s2_title: 'Co umím mimo hřiště',
      st_sub: 'Technologie, se kterými pracuju — a malá ukázka, jak o sobě přemýšlím v kódu.',
      stack_a11y: 'Přístupnost a SEO',

      // services
      sv_eyebrow: 'Tvorba webových stránek',
      sv_t1: 'Co pro tebe',
      sv_t2: 'můžu udělat<span class="accent">.</span>',
      sv_lead: 'Weby na míru, weby pro sportovce a sportovní kluby a jejich údržba. Jasná nabídka bez keců — tři věci, se kterými za mnou můžeš přijít.',
      sv_btn: 'Nezávazně se ozvi',
      sv1_title: 'Prezentační web',
      sv1_desc: 'Moderní web pro tebe, tvou firmu nebo projekt — od jedné stránky po několik podstránek. Rychlý, responzivní, žádné šablony.',
      sv2_title: 'Weby pro sportovce a kluby',
      sv2_desc: 'Profil hráče, trenéra nebo oddílu. Z první ruky vím, co sportovec potřebuje ukázat — výsledky, video, kontakt pro agenty a sponzory.',
      sv3_title: 'Úpravy a údržba webu',
      sv3_desc: 'Máš web, který potřebuje oživit, zrychlit nebo jen pravidelně udržovat? Postarám se o něj.',
      proc_label: 'Postup',
      proc_title: 'Jak to probíhá',
      proc_sub: 'Čtyři kroky od první zprávy po spuštěný web.',
      pc1_k: 'Krok 01', pc1_t: 'Ozveš se',
      pc1_p: 'Napíšeš mi, co potřebuješ — stačí pár vět. Doptám se na cíl webu, obsah a termín.',
      pc2_k: 'Krok 02', pc2_t: 'Návrh',
      pc2_p: 'Připravím strukturu a vizuální směr. Než napíšu první řádek kódu, víš, jak bude web vypadat.',
      pc3_k: 'Krok 03', pc3_t: 'Stavba',
      pc3_p: 'Web stavím ručně, bez šablon. Průběžně ti posílám náhledy, abys měl přehled a mohl do toho mluvit.',
      pc4_k: 'Krok 04', pc4_t: 'Spuštění',
      pc4_p: 'Web nasadím, otestuju na mobilu i počítači a předám. Když bude potřeba, postarám se i o další úpravy.',
      sv_note: 'Weby jsem dělal už dřív — ale jen pro radost. Nikdy jsem v tom nepodnikal ani nenabízel služby. Teď přišel ten pravý čas. Pro tebe to znamená <b>férovou startovní cenu</b> a to, že tvému projektu dám maximum — potřebuju, aby moje první reference stály za to. Tahle stránka je moje vizitka, posuď sám, jestli ti styl sedí.',

      // contact
      ct_eyebrow: 'Kontakt',
      ct_t1: 'Napiš',
      ct_t2: 'mi<span class="accent">.</span>',
      ct_lead: 'Hledáš web, který vyhraje zápas? Napiš mi pár vět o tom, co potřebuješ, a ozvu se co nejdřív.',
      ct_direct: 'Napřímo',
      ct_form: 'Nebo přes formulář',
      ct_ico: 'IČO: 24611581',
      f_name: 'Jméno',
      f_email: 'E-mail',
      f_msg: 'Co potřebuješ?',
      f_hp: 'Tohle pole nevyplňuj:',
      f_send: 'Odeslat zprávu',
      f_sending: 'Odesílám…',
      f_ok: 'Díky, zpráva dorazila. Ozvu se co nejdřív.',
      f_err: 'Zprávu se nepodařilo odeslat. <a href="mailto:' + MAIL + '">Napiš mi přímo e-mailem</a> — text se ti předvyplní.',
      f_subject: 'Poptávka webu',

      // 404
      nf_eyebrow: 'Chyba 404',
      nf_t1: 'Aut<span class="accent">.</span>',
      nf_lead: 'Tahle stránka skončila mimo hřiště. Zkus to znovu z domovské stránky.',
      nf_btn: 'Zpět na hřiště'
    },

    en: {
      title_home: 'Custom website design | Jakub Kočvara',
      title_about: 'About: volleyball player and web developer | Jakub Kočvara',
      title_services: 'Websites and sites for athletes | Jakub Kočvara',
      title_contact: 'Contact and website enquiry | Jakub Kočvara',
      title_404: 'Page not found — Jakub Kočvara',

      skip: 'Skip to content',
      aria_nav: 'Main navigation',
      aria_foot: 'Footer links',
      nav_home: 'Home', nav_about: 'About', nav_services: 'Services', nav_contact: 'Contact',
      f_note: 'built by hand, line by line',

      cta_eyebrow: 'let\'s do this',
      cta_title: 'Looking for a website that <span class="accent">wins the match</span>?',
      cta_text: 'Tell me in a few sentences what you need. I\'ll get back to you and we\'ll work out the plan.',
      cta_btn: 'Send a message',

      hero_eyebrow: 'Jakub Kočvara · volleyball player // developer',
      hl1: 'Discipline', hl2: 'from the court,', hl3: 'now written', hl4: 'in code<span class="accent">.</span>',
      f1_t: '<span>6 seasons </span><span>in 3 countries</span>',
      f1_p: '<span>Czech Extraliga, Austrian Bundesliga </span><span>and Spain\'s Superliga 2 — every season </span><span>among the top scorers.</span>',
      f2_t: '<span>Custom websites, </span><span>no templates</span>',
      f2_p: '<span>Fast, responsive websites </span><span>for athletes, clubs and businesses. </span><span>This page is the proof.</span>',
      in_label: 'Custom websites',
      in_title: 'Websites for athletes, clubs and businesses',
      in_text: 'I\'m Jakub Kočvara, a professional volleyball player who builds custom websites. I work online with clients from all over Czechia: athletes, sports clubs, freelancers and small businesses. Every site is written by hand, without templates, so it loads fast, works on phones and search engines understand it well.',
      aria_stats: 'Results in numbers',
      stat1_num: '<span>2nd</span> &amp; <span>3rd</span>',
      stat1_label: 'Place at the Czech Junior Volleyball Championship',
      stat2_label: 'Top scoring player — Spanish Superliga 2',
      stat3_num: '3 <span>years</span>',
      stat3_label: 'Czech Volleyball Extraliga — Volejbal Brno',
      stat4_label: 'Top scoring player in Austria and Spain',
      band_more: 'Full career',
      home_off_label: 'Services',
      home_off_title: 'What I can do for you',
      home_off_sub: 'A clear offer, no fluff — three things you can come to me with.',
      off1_desc: 'A modern site for you, your business or your project. Fast, responsive, no templates.',
      off2_desc: 'A profile for a player, coach or club — results, video and contact for agents and sponsors.',
      off3_desc: 'A refresh, a speed-up or regular care for the site you already have.',
      home_off_more: 'All services',
      pr_label: 'Approach',
      pr_title: 'How I work',
      pr_sub: 'Volleyball taught me discipline and repetition. I now bring the same approach to programming.',
      p1_title: '<span class="pmono">if</span> training == code',
      p1_body: 'Just like on the court — no shortcuts, only repeated work until the result is right.',
      p2_title: '<span class="pmono">for</span> every project',
      p2_body: 'I treat every website like a match — I study the opponent (the brief), prepare the tactics and give it a hundred percent.',
      p3_title: '<span class="pmono">return</span> results, not excuses',
      p3_body: 'Three countries, three leagues, six seasons — they taught me to finish things even under deadline pressure.',

      ab_eyebrow: 'About',
      ab_t1: 'From the court',
      ab_t2: 'to the screen<span class="accent">.</span>',
      ab_lead: 'I\'m 24 and on the court I play as an opposite hitter. I\'ve spent six seasons in the leagues of three countries — and built websites for fun along the way. Now I\'m making it my work, and bringing everything the court taught me.',
      car_label: 'Career',
      s1_title: 'Career on the court',
      s1_sub: 'Chronologically — where I started and where it has taken me so far.',
      t1_year: 'Junior category',
      t1_title: '2nd &amp; 3rd place at the Czech Junior Championship',
      t1_desc: 'Twice on the podium at the Czech junior volleyball championship — one silver, one bronze.',
      t1_tags: '<span>Czechia</span><span>juniors</span><span>volleyball</span>',
      t2_year: '3 seasons',
      t2_title: 'Volejbal Brno — Czech Extraliga',
      t2_desc: 'Three years in the top Czech league. The court where a promising junior becomes a player you can rely on.',
      t2_tags: '<span>Czech Extraliga</span><span>3 seasons</span>',
      t3_year: '2 seasons',
      t3_title: 'TJ Sokol Wien — Austrian Bundesliga',
      t3_desc: 'A move to Austria and both seasons among the league\'s top 5 scorers. Proof that the form was no accident.',
      t3_tags: '<span>Bundesliga</span><span>Top 5 — both seasons</span>',
      t4_year: '1 season',
      t4_title: 'Spain — Superliga 2',
      t4_desc: 'The latest stop so far: Spanish Superliga 2, where I finished among the top 3 scorers of the competition.',
      st_label: 'Stack',
      s2_title: 'What I do off the court',
      st_sub: 'The technologies I work with — and a small sample of how I think about myself in code.',
      stack_a11y: 'Accessibility & SEO',

      sv_eyebrow: 'Web design &amp; development',
      sv_t1: 'What I can',
      sv_t2: 'do for you<span class="accent">.</span>',
      sv_lead: 'Custom websites, sites for athletes and sports clubs, and their upkeep. A clear offer, no fluff — three things you can come to me with.',
      sv_btn: 'Get in touch',
      sv1_title: 'Presentation website',
      sv1_desc: 'A modern site for you, your business or your project — from a single page to several subpages. Fast, responsive, no templates.',
      sv2_title: 'Sites for athletes & clubs',
      sv2_desc: 'A profile for a player, coach or club. I know first-hand what an athlete needs to show — results, video, contact for agents and sponsors.',
      sv3_title: 'Website updates & maintenance',
      sv3_desc: 'Got a site that needs a refresh, a speed-up, or just regular care? I\'ll look after it.',
      proc_label: 'Process',
      proc_title: 'How it works',
      proc_sub: 'Four steps from the first message to a live website.',
      pc1_k: 'Step 01', pc1_t: 'You get in touch',
      pc1_p: 'Tell me what you need — a few sentences are enough. I\'ll ask about the goal of the site, the content and the deadline.',
      pc2_k: 'Step 02', pc2_t: 'Design',
      pc2_p: 'I prepare the structure and the visual direction. Before I write a single line of code, you know what the site will look like.',
      pc3_k: 'Step 03', pc3_t: 'Build',
      pc3_p: 'I build the site by hand, no templates. You get previews along the way, so you stay in the loop and can weigh in.',
      pc4_k: 'Step 04', pc4_t: 'Launch',
      pc4_p: 'I deploy the site, test it on phone and desktop and hand it over. If needed, I\'ll take care of later changes too.',
      sv_note: 'I\'ve been building websites for a while — but purely for the fun of it. I never ran it as a business or offered my services. Now the time is right. For you that means a <b>fair starter price</b> and my full effort on your project — I need my first references to be worth showing. This page is my calling card; judge for yourself whether the style fits.',

      ct_eyebrow: 'Contact',
      ct_t1: 'Drop me',
      ct_t2: 'a line<span class="accent">.</span>',
      ct_lead: 'Looking for a website that wins the match? Tell me in a few sentences what you need and I\'ll get back to you as soon as I can.',
      ct_direct: 'Directly',
      ct_form: 'Or use the form',
      ct_ico: 'Company ID (IČO): 24611581',
      f_name: 'Name',
      f_email: 'Email',
      f_msg: 'What do you need?',
      f_hp: 'Leave this field empty:',
      f_send: 'Send message',
      f_sending: 'Sending…',
      f_ok: 'Thanks, your message arrived. I\'ll get back to you soon.',
      f_err: 'The message could not be sent. <a href="mailto:' + MAIL + '">Email me directly</a> — your text will be prefilled.',
      f_subject: 'Website enquiry',

      nf_eyebrow: 'Error 404',
      nf_t1: 'Out<span class="accent">.</span>',
      nf_lead: 'This page landed outside the court. Try again from the home page.',
      nf_btn: 'Back to the court'
    }
  };

  // terminal content, one token list per language
  const CODE = {
    cs: [
      ['const', 'tk-key'], [' jakub', ''], [' = ', 'tk-punct'], ['{\n', 'tk-punct'],
      ['  věk', 'tk-key'], [': ', 'tk-punct'], ['24', 'tk-num'], [',\n', 'tk-punct'],
      ['  pozice', 'tk-key'], [': ', 'tk-punct'], ["'diagonální útočník'", 'tk-str'], [',\n', 'tk-punct'],
      ['  ligy', 'tk-key'], [': ', 'tk-punct'], ['[', 'tk-punct'], ["'CZ'", 'tk-str'], [', ', 'tk-punct'], ["'AT'", 'tk-str'], [', ', 'tk-punct'], ["'ES'", 'tk-str'], ['],\n', 'tk-punct'],
      ['  tituly', 'tk-key'], [': ', 'tk-punct'], ["'2. a 3. místo MČR juniorů'", 'tk-str'], [',\n', 'tk-punct'],
      ['  topBodující', 'tk-key'], [': ', 'tk-punct'], ['true', 'tk-num'], [',\n', 'tk-punct'],
      ['  miluje', 'tk-key'], [': ', 'tk-punct'], ["'programování'", 'tk-str'], [',\n', 'tk-punct'],
      ['  dostupný', 'tk-key'], [': ', 'tk-punct'], ['true', 'tk-num'], ['\n', 'tk-punct'],
      ['}', 'tk-punct'], [';', 'tk-punct'],
      ['\n\n// stránku co čteš jsem napsal sám', 'tk-com']
    ],
    en: [
      ['const', 'tk-key'], [' jakub', ''], [' = ', 'tk-punct'], ['{\n', 'tk-punct'],
      ['  age', 'tk-key'], [': ', 'tk-punct'], ['24', 'tk-num'], [',\n', 'tk-punct'],
      ['  position', 'tk-key'], [': ', 'tk-punct'], ["'opposite hitter'", 'tk-str'], [',\n', 'tk-punct'],
      ['  leagues', 'tk-key'], [': ', 'tk-punct'], ['[', 'tk-punct'], ["'CZ'", 'tk-str'], [', ', 'tk-punct'], ["'AT'", 'tk-str'], [', ', 'tk-punct'], ["'ES'", 'tk-str'], ['],\n', 'tk-punct'],
      ['  titles', 'tk-key'], [': ', 'tk-punct'], ["'2nd & 3rd at Czech Junior Championship'", 'tk-str'], [',\n', 'tk-punct'],
      ['  topScorer', 'tk-key'], [': ', 'tk-punct'], ['true', 'tk-num'], [',\n', 'tk-punct'],
      ['  loves', 'tk-key'], [': ', 'tk-punct'], ["'programming'", 'tk-str'], [',\n', 'tk-punct'],
      ['  available', 'tk-key'], [': ', 'tk-punct'], ['true', 'tk-num'], ['\n', 'tk-punct'],
      ['}', 'tk-punct'], [';', 'tk-punct'],
      ['\n\n// I wrote the page you\'re reading myself', 'tk-com']
    ]
  };

  const root = document.documentElement;
  const page = (document.querySelector('main') || root).dataset.page || 'home';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // storage can be blocked (private mode, disabled site data) — never let it break the page
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } }
  };

  let lang = store.get('lang') === 'en' ? 'en' : 'cs';

  // ---------- terminal ----------
  const term = document.getElementById('typeTarget');
  let typingGen = 0;

  function cursor() {
    const c = document.createElement('span');
    c.className = 'cursor';
    return c;
  }

  function startTyping() {
    if (!term) return;
    const gen = ++typingGen;
    const tokens = CODE[lang];
    term.textContent = '';

    if (reduceMotion) {
      tokens.forEach(([text, cls]) => {
        const s = document.createElement('span');
        if (cls) s.className = cls;
        s.textContent = text;
        term.appendChild(s);
      });
      term.appendChild(cursor());
      return;
    }

    let idx = 0;
    (function nextToken() {
      if (gen !== typingGen) return;
      if (idx >= tokens.length) { term.appendChild(cursor()); return; }
      const [text, cls] = tokens[idx];
      const span = document.createElement('span');
      if (cls) span.className = cls;
      term.appendChild(span);
      let i = 0;
      (function nextChar() {
        if (gen !== typingGen) return;
        if (i < text.length) {
          span.textContent += text[i++];
          setTimeout(nextChar, 12 + Math.random() * 18);
        } else {
          idx++;
          setTimeout(nextToken, 30);
        }
      })();
    })();
  }

  // ---------- language ----------
  const langBtn = document.getElementById('langToggle');

  function applyLang(l) {
    lang = l;
    const dict = I18N[l];
    root.lang = l;
    const title = dict['title_' + page];
    if (title) document.title = title;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = dict[el.dataset.i18n];
      if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const v = dict[el.dataset.i18nAria];
      if (v !== undefined) el.setAttribute('aria-label', v);
    });
    if (langBtn) {
      langBtn.textContent = l === 'cs' ? 'EN' : 'CZ';
      langBtn.setAttribute('aria-label', l === 'cs' ? 'Switch to English' : 'Přepnout do češtiny');
    }
    // only restart the terminal if it has already been typed once
    if (typingGen) startTyping();
  }

  if (lang !== 'cs') applyLang(lang);
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const next = lang === 'cs' ? 'en' : 'cs';
      store.set('lang', next);
      applyLang(next);
    });
  }

  // ---------- header ----------
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');

  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function closeNav() {
    if (!header || !navToggle) return;
    header.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (header && navToggle) {
    navToggle.addEventListener('click', () => {
      const open = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    header.querySelectorAll('.site-nav a').forEach(a => a.addEventListener('click', closeNav));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  // ---------- scroll reveal + terminal start ----------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    reveals.forEach(el => io.observe(el));

    if (term) {
      const tio = new IntersectionObserver(entries => {
        if (!entries.some(e => e.isIntersecting)) return;
        tio.disconnect();
        if (!typingGen) startTyping();
      }, { threshold: 0.4 });
      tio.observe(term);
    }
  } else {
    reveals.forEach(el => el.classList.add('in'));
    startTyping();
  }

  // ---------- contact form (Netlify Forms, mail fallback) ----------
  const form = document.getElementById('contactForm');
  if (form) {
    const status = document.getElementById('formStatus');
    const submit = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const dict = I18N[lang];
      const data = new FormData(form);
      submit.disabled = true;
      status.className = 'form-status';
      status.textContent = dict.f_sending;

      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString()
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        status.classList.add('ok');
        status.textContent = dict.f_ok;
      } catch {
        const body = (data.get('zprava') || '') + '\n\n— ' + (data.get('jmeno') || '') + ' (' + (data.get('email') || '') + ')';
        status.classList.add('err');
        status.innerHTML = dict.f_err;
        const link = status.querySelector('a');
        if (link) link.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(dict.f_subject) + '&body=' + encodeURIComponent(body);
      } finally {
        submit.disabled = false;
      }
    });
  }
})();
