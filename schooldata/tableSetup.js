// tableSetup.js
document.addEventListener("DOMContentLoaded", function() {
    // Define initDataTable() so that app.js can call it after the table is populated.
    window.initDataTable = function() {
      const tableEl = document.getElementById("export-table");
      if (!tableEl || typeof simpleDatatables.DataTable === 'undefined') {
        return;
      }
  
      // Initialize the DataTable with a custom template for Flowbite styling.
      const table = new simpleDatatables.DataTable(tableEl, {
        searchable: true,
        paging: true,
        perPage: 5,
        perPageSelect: [5, 10, 15, 20],
        layout: { top: "", bottom: "" },
        template: (options, dom) => {
          return `
            <div class="${options.classes.top}">
              <div class="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-3 rtl:space-x-reverse w-full sm:w-auto">
                ${
                  options.paging && options.perPageSelect
                    ? `<div class="${options.classes.dropdown}">
                          <label class="flex items-center space-x-2">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-400">Show</span>
                            <select class="${options.classes.selector}"></select>
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-400">entries</span>
                          </label>
                       </div>`
                    : ''
                }
                <button id="exportDropdownButton" type="button"
                  class="flex w-full items-center justify-center rounded-lg border border-gray-200 
                         bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 
                         hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 
                         focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 
                         dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white 
                         dark:focus:ring-gray-700 sm:w-auto"
                >
                  Export as
                  <svg class="-me-0.5 ms-1.5 h-4 w-4" aria-hidden="true" 
                       xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                       fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" 
                          stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
                  </svg>
                </button>
                <div id="exportDropdown"
                  class="z-10 hidden w-52 divide-y divide-gray-100 rounded-lg bg-white shadow-sm dark:bg-gray-700"
                  data-popper-placement="bottom"
                >
                  <ul class="p-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                      aria-labelledby="exportDropdownButton">
                    <li>
                      <button id="export-csv"
                        class="group inline-flex w-full items-center rounded-md px-3 py-2 text-sm 
                               text-gray-500 hover:bg-gray-100 hover:text-gray-900 
                               dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        CSV
                      </button>
                    </li>
                    <li>
                      <button id="export-json"
                        class="group inline-flex w-full items-center rounded-md px-3 py-2 text-sm 
                               text-gray-500 hover:bg-gray-100 hover:text-gray-900 
                               dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        JSON
                      </button>
                    </li>
                    <li>
                      <button id="export-txt"
                        class="group inline-flex w-full items-center rounded-md px-3 py-2 text-sm 
                               text-gray-500 hover:bg-gray-100 hover:text-gray-900 
                               dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        TXT
                      </button>
                    </li>
                    <li>
                      <button id="export-sql"
                        class="group inline-flex w-full items-center rounded-md px-3 py-2 text-sm 
                               text-gray-500 hover:bg-gray-100 hover:text-gray-900 
                               dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        SQL
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              ${
                options.searchable
                  ? `<div class="${options.classes.search} relative mt-4 sm:mt-0">
                       <input 
                         class="${options.classes.input} dataTable-input pl-10 pr-4 py-2 block w-full rounded-lg border text-sm text-gray-900 focus:ring-primary-500 focus:border-primary-500" 
                         placeholder="${options.labels.placeholder}" 
                         type="search" 
                         title="${options.labels.searchTitle}"
                         ${dom.id ? "aria-controls='" + dom.id + "'" : ""}
                       />
                       <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                         <svg aria-hidden="true" class="w-4 h-4 text-gray-500 dark:text-gray-400"
                              fill="none" stroke="currentColor" stroke-width="2" 
                              viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                           <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"></path>
                           <circle cx="10" cy="10" r="6" fill="none"></circle>
                         </svg>
                       </div>
                     </div>`
                  : ''
              }
            </div>
            <div class="${options.classes.container}"
                 ${options.scrollY.length ? "style='height: " + options.scrollY + "; overflow-Y: auto;'" : ""}
            ></div>
            <div class="${options.classes.bottom}">
              ${
                options.paging
                  ? `<div class="${options.classes.info}"></div>`
                  : ''
              }
              <nav class="${options.classes.pagination}"></nav>
            </div>
          `;
        }
      });
    
      // Initialize Flowbite dropdown for the "Export as" button
      const $exportButton = document.getElementById("exportDropdownButton");
      const $exportDropdownEl = document.getElementById("exportDropdown");
      if ($exportButton && $exportDropdownEl) {
        new Dropdown($exportDropdownEl, $exportButton);
      }
    
      // Hook up export buttons – note columnDelimiter is now a comma for proper CSV formatting
      document.getElementById("export-csv").addEventListener("click", () => {
        simpleDatatables.exportCSV(table, {
          download: true,
          lineDelimiter: "\n",
          columnDelimiter: ","
        });
      });
      document.getElementById("export-json").addEventListener("click", () => {
        simpleDatatables.exportJSON(table, {
          download: true,
          space: 2
        });
      });
      document.getElementById("export-txt").addEventListener("click", () => {
        simpleDatatables.exportTXT(table, {
          download: true
        });
      });
      document.getElementById("export-sql").addEventListener("click", () => {
        simpleDatatables.exportSQL(table, {
          download: true,
          tableName: "export_table"
        });
      });
    };
  });
  