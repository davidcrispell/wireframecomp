document.addEventListener("DOMContentLoaded", function() {
    // Caching variables: cache for 1 hour (3600000 ms)
    const cacheKey = 'schoolData';
    const cacheExpiryKey = 'schoolDataExpiry';
    const cacheDuration = 60 * 60 * 1000; // 1 hour in milliseconds
  
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
  
    // Function to fetch one page given a page number.
    function fetchPage(page) {
      const pageParams = new URLSearchParams(params);
      pageParams.set('page', page);
      return fetch(`${baseUrl}?${pageParams.toString()}`)
        .then(response => response.json());
    }
  
    // Render table rows from the provided data array.
    function renderTable(data) {
      tableBody.innerHTML = '';
      console.log(`Rendering ${data.length} rows`);
      data.forEach(school => {
        const tr = document.createElement('tr');
        tr.classList.add("hover:bg-gray-50", "dark:hover:bg-gray-800", "cursor-pointer");
  
        // Extract fields.
        const schoolName = school['school.name'] || 'N/A';
        const ownership = Number(school['school.ownership']);
        const enrollment = school['latest.student.size'] ? Number(school['latest.student.size']) : 'N/A';
        const graduationRate = school['latest.completion.completion_rate_4yr_150nt'];
        const retentionRate = school['latest.student.retention_rate.four_year.full_time'];
        const predominant = school['school.degrees_awarded.predominant'];
  
        // Map state abbreviation to full state name.
        const stateAbbrev = school['school.state'];
        const stateName = stateAbbrev ? window.stateMapping[stateAbbrev.toUpperCase()] : 'N/A';
  
        // Determine if Bachelor's is offered.
        const bachelorsOffered = (predominant == 3) ? 'Yes' : 'No';
  
        // Convert ownership code to text.
        let schoolType = 'Unknown';
        if (ownership === 1) {
          schoolType = 'Public';
        } else if (ownership === 2) {
          schoolType = 'Private Nonprofit';
        } else if (ownership === 3) {
          schoolType = 'Private For-Profit';
        }
  
        // Format percentages if numeric.
        const formattedRetention =
          (typeof retentionRate === 'number')
            ? (retentionRate * 100).toFixed(1) + '%'
            : 'N/A';
        const formattedGraduation =
          (typeof graduationRate === 'number')
            ? (graduationRate * 100).toFixed(1) + '%'
            : 'N/A';
  
        // Build the table row.
        tr.innerHTML = `
          <td class="font-medium text-gray-900 whitespace-nowrap dark:text-white">
            ${schoolName}
          </td>
          <td>${stateName}</td>
          <td>${schoolType}</td>
          <td>${enrollment}</td>
          <td>${bachelorsOffered}</td>
          <td>${formattedRetention}</td>
          <td>${formattedGraduation}</td>
        `;
        tableBody.appendChild(tr);
      });
    }
  
    // Apply filters based on user input.
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
  
      const filteredData = window.allSchoolData.filter(school => {
        // Determine school type.
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
  
        // Enrollment filter.
        const enrollment = Number(school['latest.student.size']);
        if (!isNaN(enrollment)) {
          if (enrollmentMin !== null && enrollment < enrollmentMin) return false;
          if (enrollmentMax !== null && enrollment > enrollmentMax) return false;
        } else if (enrollmentMin !== null || enrollmentMax !== null) {
          return false;
        }
  
        // Retention rate filter (converted to percentage).
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
  
    // Reinitialize the DataTable after updating the table rows.
    function reinitializeDataTable() {
      if (window.dataTableInstance && typeof window.dataTableInstance.destroy === 'function') {
        console.log("Destroying existing DataTable instance");
        window.dataTableInstance.destroy(true);  // Updated to preserve current table markup
      }
      // Use setTimeout to ensure the DOM updates finish before reinitialization.
      setTimeout(() => {
        console.log("Reinitializing DataTable");
        window.initDataTable();
      }, 0);
    }
  
    // Initialize filter controls.
    function initFilters() {
      const applyBtn = document.getElementById('apply-filters');
      if (applyBtn) {
        applyBtn.addEventListener('click', function() {
          console.log("Apply Filters button clicked");
          const filteredData = applyFilters();
          renderTable(filteredData);
          reinitializeDataTable();
        });
      }
    }
  
    // Process results: store data, render table, initialize DataTable, and set up filters.
    function processResults(allResults) {
      console.log("Total results loaded:", allResults.length);
      window.allSchoolData = allResults;
      renderTable(allResults);
      window.initDataTable();
      initFilters();
    }
  
    // Check for cached data.
    const cachedData = localStorage.getItem(cacheKey);
    const cacheExpiry = localStorage.getItem(cacheExpiryKey);
    if (cachedData && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
      console.log("Loaded data from cache.");
      const allResults = JSON.parse(cachedData);
      processResults(allResults);
    } else {
      // Fetch initial page.
      fetchPage(0)
        .then(initialData => {
          if (initialData.error || initialData.errors) {
            let errorMessage = initialData.error
              ? initialData.error.message
              : initialData.errors.map(err => err.message).join(", ");
            tableBody.innerHTML = `
              <tr>
                <td colspan="7" class="px-4 py-2 text-red-600">
                  API Error: ${errorMessage}
                </td>
              </tr>
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
          tableBody.innerHTML = `
            <tr>
              <td colspan="7" class="px-4 py-2 text-red-600">
                Fetch error: ${error}
              </td>
            </tr>
          `;
          console.error(error);
        });
    }
  });
  