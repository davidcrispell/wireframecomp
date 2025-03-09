// -------------------------
// Global Variables & Helpers
// -------------------------

// Example state mapping (update as needed)
const stateMapping = {
  AL: 'Alabama',
  AK: 'Alaska',
  AS: 'American Samoa',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District of Columbia',
  FM: 'Federated States of Micronesia',
  FL: 'Florida',
  GA: 'Georgia',
  GU: 'Guam',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MH: 'Marshall Islands',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  MP: 'Northern Mariana Islands',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PW: 'Palau',
  PA: 'Pennsylvania',
  PR: 'Puerto Rico',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VI: 'Virgin Islands',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming'
};


// Global variable to hold all school data
window.allSchoolData = [];

// Ask the user whether to fetch all data or just the first page.
const fetchAll = window.confirm(
  "Do you want to fetch all data? Click OK for all pages, Cancel for just the first page."
);

// Replace with your actual API key
const API_KEY = 'caof23MEffltOqJfUdFLcPdujqPtmABupKlWswZ8';
const baseUrl = 'https://api.data.gov/ed/collegescorecard/v1/schools';
const tableBody = document.getElementById('table-body');

// Build base query parameters.
const params = new URLSearchParams();
params.append('api_key', API_KEY);
// Maximum results per page is 100.
params.append('per_page', '100');
params.append(
  'fields',
  'id,school.name,school.ownership,school.state,latest.student.size,latest.completion.completion_rate_4yr_150nt,latest.student.retention_rate.four_year.full_time,school.degrees_awarded.predominant'
);

function fetchPage(page) {
  const pageParams = new URLSearchParams(params);
  pageParams.set('page', page);
  return fetch(`${baseUrl}?${pageParams.toString()}`)
    .then(response => response.json());
}


// -------------------------
// Full Table Rendering Function
// -------------------------
function renderTable(data) {
  let rowsHtml = '';
  console.log(`Rendering ${data.length} rows`);

  data.forEach(school => {
    const schoolName = school['school.name'] || 'N/A';
    const ownership = Number(school['school.ownership']);
    const enrollment = school['latest.student.size'] ? Number(school['latest.student.size']) : 'N/A';
    const graduationRate = school['latest.completion.completion_rate_4yr_150nt'];
    const retentionRate = school['latest.student.retention_rate.four_year.full_time'];
    const predominant = school['school.degrees_awarded.predominant'];

    // Map state abbreviation to full name using the global stateMapping.
    const stateAbbrev = school['school.state'];
    const stateName = stateAbbrev ? stateMapping[stateAbbrev.toUpperCase()] : 'N/A';

    // Determine if Bachelor's is offered.
    const bachelorsOffered = (predominant == 3) ? 'Yes' : 'No';

    // Convert ownership code to a readable school type.
    let schoolType = 'Unknown';
    if (ownership === 1) {
      schoolType = 'Public';
    } else if (ownership === 2) {
      schoolType = 'Private Nonprofit';
    } else if (ownership === 3) {
      schoolType = 'Private For-Profit';
    }

    // Format percentages.
    const formattedRetention = (typeof retentionRate === 'number')
      ? (retentionRate * 100).toFixed(1) + '%'
      : 'N/A';
    const formattedGraduation = (typeof graduationRate === 'number')
      ? (graduationRate * 100).toFixed(1) + '%'
      : 'N/A';

    // Build the table row with extra padding.
    rowsHtml += `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
        <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${schoolName}</td>
        <td class="px-6 py-4">${stateName}</td>
        <td class="px-6 py-4">${schoolType}</td>
        <td class="px-6 py-4">${enrollment}</td>
        <td class="px-6 py-4">${bachelorsOffered}</td>
        <td class="px-6 py-4">${formattedRetention}</td>
        <td class="px-6 py-4">${formattedGraduation}</td>
      </tr>
    `;
  });

  // Build the table with fixed layout and fixed-width columns.
  return `
    <table id="export-table" class="min-w-full text-sm text-left text-gray-500 dark:text-gray-400 border" style="table-layout: fixed;">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th style="width: 300px;" class="px-6 py-3">
            <span class="flex items-center">
              Name
              <svg class="w-4 h-4 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="m8 15 4 4 4-4m0-6-4-4-4 4"/>
              </svg>
            </span>
          </th>
          <th style="width: 80px;" class="px-6 py-3">
            <span class="flex items-center">
              State
              <svg class="w-4 h-4 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="m8 15 4 4 4-4m0-6-4-4-4 4"/>
              </svg>
            </span>
          </th>
          <th style="width: 100px;" class="px-6 py-3">
            <span class="flex items-center">
              School Type
              <svg class="w-4 h-4 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                   width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="m8 15 4 4 4-4m0-6-4-4-4 4"/>
              </svg>
            </span>
          </th>
          <th style="width: 110px;" class="px-6 py-3">
            <span class="flex items-center">
              Enrollment
              <svg class="w-4 h-4 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                   width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="m8 15 4 4 4-4m0-6-4-4-4 4"/>
              </svg>
            </span>
          </th>
          <th style="width: 130px;" class="px-6 py-3">
            <span class="flex items-center">
              Bachelor’s Offered
              <svg class="w-4 h-4 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                   width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="m8 15 4 4 4-4m0-6-4-4-4 4"/>
              </svg>
            </span>
          </th>
          <th style="width: 130px;" class="px-6 py-3">
            <span class="flex items-center">
              Retention Rate
              <svg class="w-4 h-4 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                   width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="m8 15 4 4 4-4m0-6-4-4-4 4"/>
              </svg>
            </span>
          </th>
          <th style="width: 130px;" class="px-6 py-3">
            <span class="flex items-center">
              Graduation Rate
              <svg class="w-4 h-4 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                   width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="m8 15 4 4 4-4m0-6-4-4-4 4"/>
              </svg>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;
}

// -------------------------
// Data Fetching, Filtering & Rendering
// -------------------------
const cacheKey = 'schoolData';
const cacheExpiryKey = 'schoolDataExpiry';
const cacheDuration = 60 * 60 * 1000; // 1 hour
let allSchoolData = [];

// Assume there is a container with the ID "table-container" in your HTML.
const tableContainer = document.getElementById('table-container');

// Process results and render the table, then initialize DataTable.
function processResults(allResults) {
  console.log("Total results loaded:", allResults.length);
  allSchoolData = allResults;
  tableContainer.innerHTML = renderTable(allResults);
  initDataTable();
}

// Apply filters to the data and re-render the table.
function applyFilters() {
  let schoolTypeFilter = document.getElementById('filter-school-type').value;
  let enrollmentMin = parseInt(document.getElementById('filter-enrollment-min').value);
  let enrollmentMax = parseInt(document.getElementById('filter-enrollment-max').value);
  let retentionMin = parseFloat(document.getElementById('filter-retention-min').value);
  let retentionMax = parseFloat(document.getElementById('filter-retention-max').value);

  console.log('Filter values:', schoolTypeFilter, enrollmentMin, enrollmentMax, retentionMin, retentionMax);

  if (isNaN(enrollmentMin)) enrollmentMin = null;
  if (isNaN(enrollmentMax)) enrollmentMax = null;
  if (isNaN(retentionMin)) retentionMin = null;
  if (isNaN(retentionMax)) retentionMax = null;

  const filteredData = allSchoolData.filter(school => {
    const ownership = Number(school['school.ownership']);
    let schoolType = 'Unknown';
    if (ownership === 1) {
      schoolType = 'Public';
    } else if (ownership === 2) {
      schoolType = 'Private Nonprofit';
    } else if (ownership === 3) {
      schoolType = 'Private For-Profit';
    }
    if (schoolTypeFilter && schoolType !== schoolTypeFilter) {
      return false;
    }

    const enrollment = Number(school['latest.student.size']);
    if (!isNaN(enrollment)) {
      if (enrollmentMin !== null && enrollment < enrollmentMin) return false;
      if (enrollmentMax !== null && enrollment > enrollmentMax) return false;
    } else if (enrollmentMin !== null || enrollmentMax !== null) {
      return false;
    }

    const retentionRate = Number(school['latest.student.retention_rate.four_year.full_time']);
    if (!isNaN(retentionRate)) {
      const retentionPercent = retentionRate * 100;
      if (retentionMin !== null && retentionPercent < retentionMin) return false;
      if (retentionMax !== null && retentionPercent > retentionMax) return false;
    } else if (retentionMin !== null || retentionMax !== null) {
      return false;
    }
    return true;
  });

  console.log(`Filtered data count: ${filteredData.length}`);
  return filteredData;
}

// -------------------------
// Data Fetching (with caching)
// -------------------------
const cachedData = localStorage.getItem(cacheKey);
const cacheExpiry = localStorage.getItem(cacheExpiryKey);
if (cachedData && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
  console.log("Loaded data from cache.");
  const allResults = JSON.parse(cachedData);
  processResults(allResults);
} else {
  const fetchAll = window.confirm("Do you want to fetch all data? Click OK for all pages, Cancel for just the first page.");
  fetchPage(0)
    .then(initialData => {
      if (initialData.error || initialData.errors) {
        const errorMessage = initialData.error
          ? initialData.error.message
          : initialData.errors.map(err => err.message).join(", ");
        tableContainer.innerHTML = `
          <table>
            <tr>
              <td colspan="7" class="px-4 py-2 text-red-600">API Error: ${errorMessage}</td>
            </tr>
          </table>
        `;
        console.error("API Error:", initialData);
        return Promise.reject("API Error");
      }
      const total = initialData.metadata.total;
      const perPage = parseInt(initialData.metadata.per_page);
      const totalPages = Math.ceil(total / perPage);
      let allResults = initialData.results || [];

      if (fetchAll && totalPages > 1) {
        let requests = [];
        for (let i = 1; i < totalPages; i++) {
          requests.push(fetchPage(i));
        }
        return Promise.all(requests).then(pages => {
          pages.forEach(pageData => {
            if (pageData.results && Array.isArray(pageData.results)) {
              allResults = allResults.concat(pageData.results);
            }
          });
          return allResults;
        });
      } else {
        return allResults;
      }
    })
    .then(allResults => {
      localStorage.setItem(cacheKey, JSON.stringify(allResults));
      localStorage.setItem(cacheExpiryKey, Date.now() + cacheDuration);
      processResults(allResults);
    })
    .catch(error => {
      tableContainer.innerHTML = `
        <table>
          <tr>
            <td colspan="7" class="px-4 py-2 text-red-600">Fetch error: ${error}</td>
          </tr>
        </table>
      `;
      console.error(error);
    });
}

// -------------------------
// Bind Filter Button
// -------------------------
document.getElementById('apply-filters').addEventListener('click', function() {
  const filteredData = applyFilters();
  tableContainer.innerHTML = renderTable(filteredData);
  initDataTable();
});

// -------------------------
// DataTable Initialization with Export, Search, and Pagination
// -------------------------
function initDataTable() {
  if (document.getElementById("export-table") && typeof simpleDatatables.DataTable !== 'undefined') {

    const table = new simpleDatatables.DataTable("#export-table", {
      perPage: 25,
      searchable: true,
      pagination: true,
      // Custom template placing export and search bar on top.
      template: (options, dom) => `
        <div class="${options.classes.top}">
          <div class="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            ${options.paging && options.perPageSelect ? `
              <div class="${options.classes.dropdown}">
                <label>
                  <select class="${options.classes.selector}"></select> ${options.labels.perPage}
                </label>
              </div>` : ""}
            <button id="exportDropdownButton" type="button" class="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 sm:w-auto">
              Export as
              <svg class="-me-0.5 ms-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
              </svg>
            </button>
            <div id="exportDropdown" class="z-10 hidden w-52 divide-y divide-gray-100 rounded-lg bg-white shadow-sm dark:bg-gray-700">
              <ul class="p-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400" aria-labelledby="exportDropdownButton">
                <li>
                  <button id="export-csv" class="group inline-flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <svg class="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path fill-rule="evenodd" d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2V4a2 2 0 0 0-2-2h-7Zm1.018 8.828a2.34 2.34 0 0 0-2.373 2.13v.008a2.32 2.32 0 0 0 2.06 2.497l.535.059a.993.993 0 0 0 .136.006.272.272 0 0 1 .263.367l-.008.02a.377.377 0 0 1-.018.044.49.49 0 0 1-.078.02 1.689 1.689 0 0 1-.297.021h-1.13a1 1 0 1 0 0 2h1.13c.417 0 .892-.05 1.324-.279.47-.248.78-.648.953-1.134a2.272 2.272 0 0 0-2.115-3.06l-.478-.052a.32.32 0 0 1-.285-.341.34.34 0 0 1 .344-.306l.94.02a1 1 0 1 0 .043-2l-.943-.02h-.003Zm7.933 1.482a1 1 0 1 0-1.902-.62l-.57 1.747-.522-1.726a1 1 0 0 0-1.914.578l1.443 4.773a1 1 0 0 0 1.908.021l1.557-4.773Z" clip-rule="evenodd"/>
                    </svg>
                    <span>Export CSV</span>
                  </button>
                </li>
                <li>
                  <button id="export-json" class="group inline-flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <svg class="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path fill-rule="evenodd" d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7Zm-.293 9.293a1 1 0 0 1 0 1.414L9.414 14l1.293 1.293a1 1 0 0 1-1.414 1.414l-2-2a1 1 0 0 1 0-1.414l2-2a1 1 0 0 1 1.414 0Zm2.586 1.414a1 1 0 0 1 1.414-1.414l2 2a1 1 0 0 1 0 1.414l-2 2a1 1 0 0 1-1.414-1.414Z" clip-rule="evenodd"/>
                    </svg>
                    <span>Export JSON</span>
                  </button>
                </li>
                <li>
                  <button id="export-txt" class="group inline-flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <svg class="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path fill-rule="evenodd" d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7ZM8 16a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Z" clip-rule="evenodd"/>
                    </svg>
                    <span>Export TXT</span>
                  </button>
                </li>
                <li>
                  <button id="export-sql" class="group inline-flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <svg class="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 7.205c4.418 0 8-1.165 8-2.602C20 3.165 16.418 2 12 2S4 3.165 4 4.603c0 1.437 3.582 2.602 8 2.602ZM12 22c4.963 0 8-1.686 8-2.603v-4.404c-.052.032-.112.06-.165.09a7.75 7.75 0 0 1-.745.387c-.193.088-.394.173-.6.253-.063.024-.124.05-.189.073a18.934 18.934 0 0 1-6.3.998c-2.135.027-4.26-.31-6.3-.998-.065-.024-.126-.05-.189-.073a10.143 10.143 0 0 1-.852-.373 7.75 7.75 0 0 1-.493-.267c-.053-.03-.113-.058-.165-.09v4.404C4 20.315 7.037 22 12 22Zm7.09-13.928a9.91 9.91 0 0 1-.6.253c-.063.025-.124.05-.189.074a18.935 18.935 0 0 1-6.3.998c-2.135.027-4.26-.31-6.3-.998-.065-.024-.126-.05-.189-.074a10.163 10.163 0 0 1-.852-.372 7.816 7.816 0 0 1-.493-.268c-.055-.03-.115-.058-.167-.09V12c0 .917 3.037 2.603 8 2.603s8-1.686 8-2.603V7.596c-.052.031-.112.059-.165.09a7.816 7.816 0 0 1-.745.386Z"/>
                    </svg>
                    <span>Export SQL</span>
                  </button>
                </li>
              </ul>
            </div>
            ${options.searchable ? `
              <div class="${options.classes.search}">
                <input class="${options.classes.input}" placeholder="${options.labels.placeholder}" type="search" title="${options.labels.searchTitle}"${dom.id ? " aria-controls='" + dom.id + "'" : ""}>
              </div>` : ""}
          </div>
        </div>
        <div class="${options.classes.container}"${options.scrollY.length ? " style='height: " + options.scrollY + "; overflow-Y: auto;'" : ""}></div>
        <div class="${options.classes.bottom}">
          ${options.paging ? `<div class="${options.classes.info}"></div>` : ""}
          <nav class="${options.classes.pagination}"></nav>
        </div>
      `
    });

    // Bind export button events.
    const $exportButton = document.getElementById("exportDropdownButton");
    const $exportDropdownEl = document.getElementById("exportDropdown");
    const dropdown = new Dropdown($exportDropdownEl, $exportButton);

    document.getElementById("export-csv").addEventListener("click", () => {
      simpleDatatables.exportCSV(table, {
        download: true,
        lineDelimiter: "\n",
        columnDelimiter: ";"
      });
    });
    document.getElementById("export-sql").addEventListener("click", () => {
      simpleDatatables.exportSQL(table, {
        download: true,
        tableName: "export_table"
      });
    });
    document.getElementById("export-txt").addEventListener("click", () => {
      simpleDatatables.exportTXT(table, {
        download: true
      });
    });
    document.getElementById("export-json").addEventListener("click", () => {
      simpleDatatables.exportJSON(table, {
        download: true,
        space: 3
      });
    });
  }
}
