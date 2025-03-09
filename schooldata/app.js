// app.js
document.addEventListener("DOMContentLoaded", function() {
    // Replace with your actual API key
    const API_KEY = 'caof23MEffltOqJfUdFLcPdujqPtmABupKlWswZ8';
    const baseUrl = 'https://api.data.gov/ed/collegescorecard/v1/schools';
    const tableBody = document.getElementById('table-body');
  
    // Build query parameters
    const params = new URLSearchParams();
    params.append('api_key', API_KEY);
    // Example: filter enrollment between 1000 and 5000
    params.append('latest.student.size__range', '1000..5000');
    // Include fields, including the 4-year full-time retention
    params.append('fields', 'id,school.name,school.control,latest.student.size,latest.completion.rate,latest.student.retention_rate.four_year.full_time_pooled');
  
    fetch(`${baseUrl}?${params.toString()}`)
      .then(response => response.json())
      .then(data => {
        console.log("Data from API:", data);
  
        // Check for API errors
        if (data.error || data.errors) {
          let errorMessage = "";
          if (data.error) {
            errorMessage = data.error.message;
          } else if (data.errors && Array.isArray(data.errors)) {
            errorMessage = data.errors.map(err => err.message).join(", ");
          }
          tableBody.innerHTML = `<tr><td colspan="6" class="px-4 py-2 text-red-600">API Error: ${errorMessage}</td></tr>`;
          console.error("API Error:", data);
          return;
        }
  
        // Check if results exist
        if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="6" class="px-4 py-2 text-red-600">No results found.</td></tr>';
          console.error("No results found in API response:", data);
          return;
        }
  
        // Populate rows
        data.results.forEach(school => {
          const tr = document.createElement('tr');
          tr.classList.add("hover:bg-gray-50", "dark:hover:bg-gray-800", "cursor-pointer");
  
          // Extract fields
          const schoolName = school['school.name'] || 'N/A';
          const schoolControl = school['school.control'];
          const enrollment = school['latest.student.size'] || 'N/A';
          const graduationRate = school['latest.completion.rate'];
          // Retention for 4-year, full-time students
          const retentionRate = school['latest.student.retention_rate.four_year.full_time_pooled'];
  
          // Convert numeric control => text
          let schoolType = 'Unknown';
          if (schoolControl === 1) {
            schoolType = 'Public';
          } else if (schoolControl === 2) {
            schoolType = 'Private Nonprofit';
          } else if (schoolControl === 3) {
            schoolType = 'Private For-Profit';
          }
  
          // Placeholder for Bachelor's offered
          const bachelorsOffered = 'Yes/No';
  
          // Format decimals as percentages
          const formattedRetention = retentionRate ? (retentionRate * 100).toFixed(1) + '%' : 'N/A';
          const formattedGraduation = graduationRate ? (graduationRate * 100).toFixed(1) + '%' : 'N/A';
  
          tr.innerHTML = `
            <td class="font-medium text-gray-900 whitespace-nowrap dark:text-white">${schoolName}</td>
            <td>${schoolType}</td>
            <td>${enrollment}</td>
            <td>${bachelorsOffered}</td>
            <td>${formattedRetention}</td>
            <td>${formattedGraduation}</td>
          `;
          tableBody.appendChild(tr);
        });
  
        // Initialize the data table (search, pagination, export)
        initDataTable();
      })
      .catch(error => console.error('Error fetching data:', error));
  });
  