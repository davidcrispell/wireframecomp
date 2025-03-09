document.addEventListener("DOMContentLoaded", function() {
    // Caching variables: cache for 1 hour (3600000 ms)
    const cacheKey = 'schoolData';
    const cacheExpiryKey = 'schoolDataExpiry';
    const cacheDuration = 60 * 60 * 1000; // 1 hour in milliseconds
  
    // Ask the user whether to fetch all data or just the first page.
    const fetchAll = window.confirm(
      "Do you want to fetch all data? Click OK for all pages, Cancel for just the first page."
    );
  
    // Replace with your actual API key
    const API_KEY = 'caof23MEffltOqJfUdFLcPdujqPtmABupKlWswZ8';
    const baseUrl = 'https://api.data.gov/ed/collegescorecard/v1/schools';
    const tableBody = document.getElementById('table-body');
  
    // Build base query parameters – using school.state (2-letter code) for state info.
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
  
    // Function to process results and populate the table.
    function processResults(allResults) {
      console.log("Total results loaded:", allResults.length);
  
      allResults.forEach(school => {
        const tr = document.createElement('tr');
        tr.classList.add("hover:bg-gray-50", "dark:hover:bg-gray-800", "cursor-pointer");
  
        // Extract fields
        const schoolName = school['school.name'] || 'N/A';
        const ownership = school['school.ownership'];
        const enrollment = school['latest.student.size'] || 'N/A';
        const graduationRate = school['latest.completion.completion_rate_4yr_150nt'];
        const retentionRate = school['latest.student.retention_rate.four_year.full_time'];
        const predominant = school['school.degrees_awarded.predominant'];
  
        // Get state abbreviation from the API and map it to full state name.
        const stateAbbrev = school['school.state'];
        const stateName = window.stateMapping[stateAbbrev] || 'N/A';
  
        // Determine if Bachelor's is offered
        const bachelorsOffered = (predominant == 3) ? 'Yes' : 'No';
  
        // Convert ownership code to text
        let schoolType = 'Unknown';
        if (ownership === 1) {
          schoolType = 'Public';
        } else if (ownership === 2) {
          schoolType = 'Private Nonprofit';
        } else if (ownership === 3) {
          schoolType = 'Private For-Profit';
        }
  
        // Format as percentages if numeric
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
  
      // Initialize the datatable (adds search, pagination, export controls)
      initDataTable();
    }
  
    // Check if cached data exists and is still valid.
    const cachedData = localStorage.getItem(cacheKey);
    const cacheExpiry = localStorage.getItem(cacheExpiryKey);
    if (cachedData && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
      console.log("Loaded data from cache.");
      const allResults = JSON.parse(cachedData);
      processResults(allResults);
    } else {
      // First, fetch page 0 to get metadata and initial results.
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
  
          // Extract pagination metadata.
          const total = initialData.metadata.total;
          const perPage = parseInt(initialData.metadata.per_page);
          const totalPages = Math.ceil(total / perPage);
  
          // The first page of results.
          let allResults = initialData.results || [];
  
          // If the user wants all pages AND there is more than one page, fetch the rest.
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
            // Only return page 0 if user opted out of fetching all.
            return allResults;
          }
        })
        .then(allResults => {
          // Cache the results for future use.
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
  