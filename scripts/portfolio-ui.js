(() => {
  const hasContent = value => Array.isArray(value)
    ? value.length > 0
    : value !== undefined && value !== null && String(value).trim() !== '';

  const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const activeLanguage = () => typeof currentLang === 'string' && currentLang === 'ko' ? 'ko' : 'en';

  const localizedField = (record, field, language = activeLanguage()) => {
    if (!record) return '';
    const direct = record[field];
    if (direct && typeof direct === 'object' && !Array.isArray(direct)) {
      return (language === 'ko' ? [direct.ko, direct.en] : [direct.en, direct.ko]).find(hasContent) || '';
    }
    const english = [direct, record.en?.[field]];
    const korean = [record[`${field}Ko`], record.ko?.[field]];
    return (language === 'ko' ? [...korean, ...english] : [...english, ...korean]).find(hasContent) || '';
  };

  const renderRichText = value => (Array.isArray(value) ? value : [value]).map(part => {
    const item = typeof part === 'string' ? { text: part } : (part || {});
    let output = escapeHtml(item.text);
    if (item.bold) output = `<strong>${output}</strong>`;
    if (item.italic) output = `<em>${output}</em>`;
    if (item.href) output = `<a href="${escapeHtml(item.href)}" target="_blank" rel="noopener" class="text-[#2b6cb0] hover:underline">${output}</a>`;
    return output;
  }).join('');

  const languageSpans = (record, field) => `<span class="lang-en">${escapeHtml(localizedField(record, field, 'en'))}</span><span class="lang-ko" style="display:none;">${escapeHtml(localizedField(record, field, 'ko'))}</span>`;

  function renderProfile(data) {
    const profile = data.profile || {};
    const socialLinks = (profile.socialLinks || []).filter(link => link?.href).map(link => `<a href="${escapeHtml(link.href)}" target="_blank" rel="noopener" class="text-gray-600 hover:text-[#2b6cb0] transition-colors" title="${escapeHtml(link.label)}"><i class="${escapeHtml(link.icon)} text-2xl"></i></a>`).join('');
    const identity = (imageClass, imageMargin, compact = false) => `
      <div class="flex justify-center ${imageMargin}"><img src="${escapeHtml(profile.photo)}" alt="Profile" class="${imageClass} rounded-full object-cover border-4 border-gray-200 shadow-md"></div>
      <h1 class="${compact ? 'text-2xl' : 'text-3xl'} font-bold text-center mb-3">${languageSpans(profile, 'name')}</h1>
      <p class="text-center text-gray-600 mb-4">${languageSpans(profile, 'position')}</p>
      <p class="text-center text-sm text-gray-600 ${compact ? 'mb-6' : 'mb-8'} leading-relaxed">${languageSpans(profile, 'focus')}</p>
      <div class="flex justify-center space-x-4 mb-8">${socialLinks}<button onclick="copyToClipboard('${escapeHtml(profile.email)}')" class="text-gray-600 hover:text-[#2b6cb0] transition-colors focus:outline-none" title="Copy Email"><i class="fas fa-envelope text-2xl"></i></button><button type="button" onclick="openPrintCv()" class="text-gray-600 hover:text-[#2b6cb0] transition-colors focus:outline-none" title="Print CV"><i class="fas fa-print text-2xl"></i></button></div>`;

    const mobilePanel = document.querySelector('#mobileMenu > div');
    if (mobilePanel) mobilePanel.innerHTML = identity('w-32 h-32', 'mb-4', true);
    const desktopPanel = document.querySelector('aside > div');
    if (desktopPanel) desktopPanel.innerHTML = `${identity('w-48 h-48', 'mb-6')}<div class="mt-auto pt-8 border-t border-gray-200"><p class="text-xs text-center text-gray-500">© 2026 ${escapeHtml(localizedField(profile, 'name', 'en'))}. All rights reserved.</p></div>`;

    const aboutBlocks = Array.isArray(data.about) ? data.about : [];
    const about = document.getElementById('about');
    if (about) about.innerHTML = `<h2 class="text-3xl font-bold text-[#2b6cb0] mb-6">About Me</h2><div class="lang-en prose max-w-none text-gray-700 leading-relaxed">${aboutBlocks.map(block => `<p class="mb-4">${renderRichText(localizedField(block, 'en', 'en'))}</p>`).join('')}</div><div class="lang-ko prose max-w-none text-gray-700 leading-relaxed" style="display:none;">${aboutBlocks.map(block => `<p class="mb-4">${renderRichText(localizedField(block, 'ko', 'ko'))}</p>`).join('')}</div>`;

    const interests = document.getElementById('research-interests');
    if (interests) {
      const rows = language => (data.researchInterests || []).map(item => {
        const title = localizedField(item, 'title', language);
        const description = localizedField(item, 'description', language);
        return `<li><span class="font-semibold text-gray-900">${escapeHtml(title)}</span>${description ? `<p class="text-base text-gray-600 ml-6 mt-1 mb-2">${escapeHtml(description)}</p>` : ''}</li>`;
      }).join('');
      interests.innerHTML = `<h2 class="text-3xl font-bold text-[#2b6cb0] mb-6">Research Interests</h2><ul class="lang-en list-disc list-inside space-y-3 text-gray-700 text-lg">${rows('en')}</ul><ul class="lang-ko list-disc list-inside space-y-3 text-gray-700 text-lg" style="display:none;">${rows('ko')}</ul>`;
    }

    const education = document.getElementById('education');
    if (education) {
      const rows = language => (data.educationExperience || []).map(item => {
        const title = localizedField(item, 'title', language);
        const organization = localizedField(item, 'organization', language);
        const details = localizedField(item, 'details', language);
        const detailRows = (Array.isArray(details) ? details : (details ? [details] : [])).map(detail => `<p class="text-sm text-gray-500 mt-2">${escapeHtml(detail)}</p>`).join('');
        return `<div class="flex flex-col md:flex-row md:items-start"><div class="md:w-32 text-gray-500 text-sm font-medium mb-2 md:mb-0">${escapeHtml(item.period || '')}</div><div class="flex-1">${title ? `<h3 class="text-xl font-semibold mb-1">${escapeHtml(title)}</h3>` : ''}${organization ? `<p class="text-gray-600 mb-1">${escapeHtml(organization)}</p>` : ''}${detailRows}</div></div>`;
      }).join('');
      education.innerHTML = `<h2 class="text-3xl font-bold text-[#2b6cb0] mb-6">Education / Experience</h2><div class="lang-en space-y-6">${rows('en')}</div><div class="lang-ko space-y-6" style="display:none;">${rows('ko')}</div>`;
    }

    const contact = document.getElementById('contact');
    if (contact) contact.innerHTML = `<h2 class="text-3xl font-bold text-[#2b6cb0] mb-6">Contact</h2><div class="space-y-4 text-gray-700"><p class="flex items-center"><i class="fas fa-envelope mr-3 text-[#2b6cb0] w-5"></i><button onclick="copyToClipboard('${escapeHtml(data.contact?.email || '')}')" class="link-hover hover:underline text-left">${escapeHtml(data.contact?.emailDisplay || data.contact?.email || '')}</button></p><p class="flex items-center"><i class="fas fa-map-marker-alt mr-3 text-[#2b6cb0] w-5"></i>${languageSpans(data.contact, 'location')}</p></div>`;
  }

  function renderProjects(projects) {
    const container = document.getElementById('research-projects-list');
    if (!container) return;
    const render = language => (projects || []).map(project => {
      const period = localizedField(project, 'period', language);
      const title = localizedField(project, 'title', language);
      const description = localizedField(project, 'description', language);
      const funder = localizedField(project, 'funder', language);
      const pi = localizedField(project, 'pi', language);
      const keywords = localizedField(project, 'focus', language);
      const label = language === 'ko' ? { funder: '지원기관', period: '참여기간', pi: '연구책임자(PI)', keywords: '핵심 키워드' } : { funder: 'Funder', period: 'Participation Period', pi: 'PI', keywords: 'Keywords' };
      return `<article class="border-l-4 border-[#2b6cb0] pl-4 py-2 transition hover:bg-gray-50">${title ? `<h3 class="text-xl font-semibold mb-2 leading-tight">${escapeHtml(title)}</h3>` : ''}${description ? `<p class="text-gray-600 mb-2 leading-relaxed">${escapeHtml(description)}</p>` : ''}${funder ? `<p class="text-sm text-gray-500 mb-1"><span class="font-medium text-gray-600">${label.funder}:</span> ${escapeHtml(funder)}</p>` : ''}${period ? `<p class="text-sm text-gray-500 mb-1"><span class="font-medium text-gray-600">${label.period}:</span> ${escapeHtml(period)}</p>` : ''}${pi ? `<p class="text-sm text-gray-500 mb-1"><span class="font-medium text-gray-600">${label.pi}:</span> ${escapeHtml(pi)}</p>` : ''}${keywords ? `<p class="text-sm text-gray-500"><span class="font-medium text-gray-600">${label.keywords}:</span> ${escapeHtml(keywords)}</p>` : ''}</article>`;
    }).join('');
    container.innerHTML = `<div class="lang-en space-y-6">${render('en')}</div><div class="lang-ko space-y-6" style="display:none;">${render('ko')}</div>`;
  }

  function renderPublications(papers) {
    const isManuscript = paper => String(paper.status || 'published').trim().toLowerCase() !== 'published';
    const toggle = document.getElementById('publications-manuscript-toggle');
    const manuscriptCount = (papers || []).filter(isManuscript).length;
    let showManuscripts = false;
    const toggleText = visible => {
      const korean = activeLanguage() === 'ko';
      const title = korean ? `출판중인 논문 (${manuscriptCount})` : `Manuscripts in Progress (${manuscriptCount})`;
      return korean ? `${title} ${visible ? '접기' : '보기'}` : `${visible ? 'Hide' : 'Show'} ${title}`;
    };

    const byCategory = category => (papers || []).filter(paper =>
      (category === 'international' ? paper.category === 'international' || !paper.category : paper.category === category) &&
      (showManuscripts || !isManuscript(paper))
    );
    const renderList = list => !list.length ? '<div class="text-gray-500 italic">No publications in this category.</div>' : list.map(paper => {
      const language = activeLanguage();
      const automaticGrade = paper.isSCI ? `SCI${paper.quartile ? `, ${paper.quartile}` : ''}${paper.topPercent ? ` (Top ${paper.topPercent}%${paper.jcrYear ? `, JCR ${paper.jcrYear}` : ''})` : ''}` : (paper.isKSCI ? 'KSCI' : '');
      const journalGrade = localizedField(paper, 'journalGrade', language) || automaticGrade;
      const badge = journalGrade ? `<span class="text-red-600 font-bold mr-2">[${escapeHtml(journalGrade)}]</span>` : '';
      const status = typeof paper.status === 'string' ? paper.status.trim() : '';
      const statusBadge = status && String(status).toLowerCase() !== 'published' ? `<span class="text-amber-700 font-bold mr-2">[${escapeHtml(status)}]</span>` : '';
      const authors = localizedField(paper, 'authors', language);
      const authorText = Array.isArray(authors) ? authors.map(author => author.bold ? `<u><strong>${escapeHtml(author.name || author)}</strong></u>` : escapeHtml(author.name || author)).join(', ') : escapeHtml(authors).replace(/Damsub Lim|D Lim|임담섭/g, name => `<u><strong>${name}</strong></u>`);
      const authorLine = authorText ? `<p class="text-gray-600 mb-2">${authorText}</p>` : '';
      const authorRole = localizedField(paper, 'authorRole', language);
      const authorRoleLabel = language === 'ko' ? '저자 역할' : 'Author Role';
      const authorRoleLine = !authorText && authorRole ? `<p class="text-gray-600 mb-2"><span class="font-medium">${authorRoleLabel}:</span> ${escapeHtml(authorRole)}</p>` : '';
      const submittedDate = paper.submittedDate ? String(paper.submittedDate).trim() : '';
      const submittedDateLabel = language === 'ko' ? '제출일' : 'Submission Date';
      const submittedDateLine = isManuscript(paper) && submittedDate ? `<p class="text-gray-500 text-sm mb-2"><span class="font-medium text-gray-600">${submittedDateLabel}:</span> ${escapeHtml(submittedDate)}</p>` : '';
      const doi = paper.links?.doi;
      const doiUrl = doi ? (doi.startsWith('http') ? doi : `https://doi.org/${doi}`) : '';
      return `<div class="border-l-4 border-[#2b6cb0] pl-4 py-2 transition hover:bg-gray-50"><h3 class="text-xl font-semibold mb-2 leading-tight"><span class="text-gray-800">${badge}${statusBadge}${escapeHtml(localizedField(paper, 'title', language))}</span></h3>${authorLine}${authorRoleLine}${submittedDateLine}<p class="text-gray-500 text-sm mb-2"><em>${escapeHtml(localizedField(paper, 'venue', language))}${paper.year ? ` (${escapeHtml(paper.year)})` : ''}</em>${doiUrl ? ` <span class="not-italic text-[#2b6cb0]">/ <a href="${escapeHtml(doiUrl)}" target="_blank" rel="noopener" class="hover:text-[#2c5282] whitespace-nowrap"><i class="fas fa-link mr-1"></i>DOI</a></span>` : ''}</p></div>`;
    }).join('');
    const international = document.getElementById('publications-international-list');
    const domestic = document.getElementById('publications-domestic-list');
    const renderAll = () => {
      if (international) international.innerHTML = renderList(byCategory('international'));
      if (domestic) domestic.innerHTML = renderList(byCategory('domestic'));
    };
    if (toggle) {
      toggle.innerHTML = manuscriptCount ? `<button type="button" class="inline-flex items-center gap-2 rounded border border-[#2b6cb0] px-3 py-2 text-sm font-medium text-[#2b6cb0] hover:bg-blue-50" aria-expanded="false"><i class="fas fa-chevron-down"></i><span>${toggleText(false)}</span></button>` : '';
      const button = toggle.querySelector('button');
      button?.addEventListener('click', () => {
        showManuscripts = !showManuscripts;
        button.setAttribute('aria-expanded', String(showManuscripts));
        button.innerHTML = showManuscripts ? `<i class="fas fa-chevron-up"></i><span>${toggleText(true)}</span>` : `<i class="fas fa-chevron-down"></i><span>${toggleText(false)}</span>`;
        renderAll();
      });
    }
    renderAll();
  }

  function printSnapshot(language) {
    const data = window.portfolioData || {};
    const profileData = data.profile || data;
    const profile = profileData.profile || {};
    return {
      name: localizedField(profile, 'name', language), position: localizedField(profile, 'position', language), focus: localizedField(profile, 'focus', language), photo: profile.photo || '', email: profileData.contact?.emailDisplay || profileData.contact?.email || '', location: localizedField(profileData.contact, 'location', language),
      education: (profileData.educationExperience || []).map(item => {
        const org = localizedField(item, 'organization', language);
        const rawDetails = localizedField(item, 'details', language);
        const detailsArray = Array.isArray(rawDetails) ? rawDetails : (rawDetails ? [rawDetails] : []);
        const filteredDetails = detailsArray.filter(detail => !/^(Advisor|지도교수)\s*:/i.test(String(detail).trim()));
        return { date: item.period || '', title: localizedField(item, 'title', language), details: [org, ...filteredDetails].filter(hasContent) };
      }),
      // The print CV is a publication record: manuscripts in progress stay on
      // the web view and are excluded regardless of the on-screen toggle state.
      papers: (data.publications?.papers || []).filter(paper => String(paper.status || 'published').trim().toLowerCase() === 'published'), projects: data.researchProjects || [], interests: (profileData.researchInterests || []).map(item => ({ title: localizedField(item, 'title', language), detail: localizedField(item, 'description', language) }))
    };
  }

  window.openPrintCv = () => {
    const language = activeLanguage();
    const printWindow = window.open(`print-cv.html?lang=${language}&autoprint=1`, '_blank');
    if (!printWindow) return alert('Unable to open the print preview. Please allow pop-ups and try again.');
    const ready = event => {
      if (event.source !== printWindow || event.data?.type !== 'portfolio-print-ready') return;
      printWindow.postMessage({ type: 'portfolio-print-data', language, snapshot: printSnapshot(language) }, '*');
      window.removeEventListener('message', ready);
    };
    window.addEventListener('message', ready);
  };

  const refresh = () => {
    const data = window.portfolioData;
    if (!data) return;
    renderProfile(data.profile || data);
    renderProjects(data.researchProjects || []);
    renderPublications(data.publications?.papers || []);
    if (typeof setLanguage === 'function') setLanguage(activeLanguage());
  };

  // A local file preview can load this script after DOMContentLoaded. Render
  // immediately in that case instead of leaving the static Loading… placeholders.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refresh, { once: true });
  } else {
    refresh();
  }
  document.getElementById('langToggle')?.addEventListener('click', () => window.setTimeout(refresh, 0));
})();
