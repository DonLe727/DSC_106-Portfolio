console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let navLinks = $$('nav a');

let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname,
);

currentLink?.classList.add('current');

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/index.html', title: 'Projects' },
  { url: 'contact/index.html', title: 'Contact' },
  { url: 'https://github.com/DonLe727', title: 'Github Profile' },
  { url: 'resume/index.html', title: 'Resume' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1") ? "/" : "/DSC_106%20Portfolio/";

for (let p of pages) {
  let url = p.url;
  
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  nav.insertAdjacentHTML('beforeend', `<a href="${url}">${p.title}</a>`);
}

// Insert the theme switcher HTML into the body
document.body.insertAdjacentHTML(
  'afterbegin',
  `
    <label class="color-scheme">
      Theme:
      <select id="theme-switcher">
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  `
);


let automaticOption = document.querySelector('#theme-switcher option[value="light dark"]');

let isDarkOS = window.matchMedia("(prefers-color-scheme: dark)").matches;

// 3. Update the text content dynamically
if (isDarkOS) {
  automaticOption.textContent = 'Automatic (Dark)';
} else {
  automaticOption.textContent = 'Automatic (Light)';
}

// Grab the select element we just created
let select = document.querySelector('#theme-switcher');

// Listen for whenever the user changes the dropdown option
select.addEventListener('input', function (event) {
  document.documentElement.style.setProperty('color-scheme', event.target.value);
  // Save the user's preference to localStorage
  localStorage.colorScheme = event.target.value; 
});

// Check if a preference was previously saved
if ("colorScheme" in localStorage) {
  // Apply the saved color scheme to the page
  document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
  // Update the dropdown menu to match the saved preference
  select.value = localStorage.colorScheme;
}