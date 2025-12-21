(async () => {
  if (window.hasInitializedkdkdkdksskfafldak) {
    console.log("Already initialized")
    return
  }
  window.hasInitializedkdkdkdksskfafldak = true;
  // Constants
  // ================================
  let BUTTON_ID = 'wealthsimple-customizer-download-btn-';
  let CONTAINER_SELECTOR = '.sc-9b4b78e7-0.eNxsrS';
  let BUTTON_CLASSES = 'sc-1dd313f8-0 clFURo sc-ecac9ab9-0 ga-drJI';


  // Functions
  // ================================

  let getRowPrice = (row) => {
    let rawValue = row.querySelector(
      '.sc-c72b029c-0.bYQrcY'
    ).textContent
      .slice(0, -4)
      .replace('$', '')
      .replace(' ', '')
    let isNegative = rawValue.charCodeAt(0) == 8722
    let num;
    let credit = 0;
    let debit = 0;
    if (isNegative) {
      debit = parseFloat(rawValue.slice(1)) * -1
    } else {
      credit = parseFloat(rawValue)
    }

    return {
      credit,
      debit
    }
  }

  let getMerchant = (row) => {
    let merchant = row.querySelector(
      '.sc-c72b029c-0.gTLTOA'
    ).textContent
    return merchant
  }

  let extractDateTime = (row) => {
    const dateBlock = [...row.querySelectorAll('.sc-9b4b78e7-0.KtAnS')]
      .find(el => el.querySelector('p')?.textContent.trim() === 'Date');

    if (!dateBlock) return null;

    const valueContainer = dateBlock.querySelector('.sc-9b4b78e7-0.hHzCYp');
    if (!valueContainer) return null;

    return [...valueContainer.querySelectorAll('p')]
      .map(p => p.textContent.replace(/\u00a0/g, ' ').trim())
      .join(' ');
  }

  function downloadCSV(data, filename = 'data') {
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Data must be a non-empty array of objects.');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // header row
      ...data.map(row =>
        headers.map(field => {
          let value = row[field] ?? '';
          // Escape quotes by doubling them
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.csv';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Opens all of the rows
  let openRows = (rows) => {
    for (let row of rows) {
      let isOpen = row.textContent.includes('Account')
      if (!isOpen) {
        row.querySelector('button').click()
      }
    }
  }
  let closeRows = (rows) => {
    for (let row of rows) {
      let isOpen = row.textContent.includes('Account')
      if (isOpen) {
        row.querySelector('button').click()
      }
    }
  }


  let getJsonData = async (monthsBackToGo) => {
    const currentDate = new Date()
    /** THis should be the date of the first day of the month */
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    let rows = Array.from(document.querySelectorAll('.sc-9b4b78e7-0.geYxEQ'))
    let results = []
    // Opens all of the rows
    openRows(rows)
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    })
    // Acts on all of the rows
    for (let row of rows) {
      let content = getRowPrice(row);
      let merchant = getMerchant(row);

      let date = extractDateTime(row)
      let dateObject = new Date(date)
      // monghtsBackToGo 0, 1, 10000, so we need to subtract it from the current date 
      // then compare it to the date object. If the cur date minus the monthsBackToGo is before the date object, then add the row to the results
      let timeToSubtract = monthsBackToGo * 30 * 24 * 60 * 60 * 1000
      if (currentMonth.getTime() - timeToSubtract < dateObject.getTime()) {
        results.push({
          ...content,
          merchant,
          isoString: new Date(date).toISOString(),
          date
        })
        
      }
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    })

    closeRows(rows)
    console.log(results)
    return results
  }

  // Create selector

  function createMonthSelector() {

    // Create wrapper for label + select
    const selector = document.createElement('div');
    selector.style.display = 'inline-block';
    selector.style.marginLeft = '8px'; // spacing from the reference node

    // Create select
    const select = document.createElement('select');
    select.name = 'past-months';
    select.style.display = 'block';
    select.style.padding = '2px';
    select.style.marginRight = '8px';

    // Define options
    const options = [
      { text: 'Current Month', value: '0' },
      { text: 'Start of last', value: '1' },
      { text: 'All', value: '10000' }
    ];

    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      select.appendChild(option);
    });

    // Append select to wrapper
    selector.appendChild(select);

    // Insert wrapper after the reference node
    return selector
  }

  function createButton(buttonId, buttonClasses) {
    let button = document.createElement('button');
    button.id = buttonId;
    button.type = 'button';
    button.textContent = ' Download';
    button.className = buttonClasses;
    button.style.marginLeft = 'auto'
    button.style.marginRight = '8px'

    // create SVG icon (flat gray download icon)
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "gray");
    svg.innerHTML = `
      <path d="M5 20h14v-2H5v2zm7-12v10l6-6h-4v-4h-4v4H6l6 6z"/>
    `;
    button.prepend(svg);
    button.style.fontWeight = 'bold'
    return button
  }



  // Initialization
  // ================================

  console.log("initializing...")
  await new Promise((resolve) => {
    setTimeout(resolve, 2_000);
  })

  let container = document.querySelector(CONTAINER_SELECTOR);
  if (!container) {
    throw new Error('Target container not found');
  }


  let monthSelector = createMonthSelector()
  let button = createButton(BUTTON_ID, BUTTON_CLASSES)

  // insert as second child
  let secondChild = container.children[1] || null;
  container.insertBefore(button, secondChild);
  container.insertBefore(monthSelector, secondChild);


  // attach fresh action listener

  button.addEventListener('click', async () => {
    let monthsBackToGo = monthSelector.querySelector('select').value
    let result = await getJsonData(monthsBackToGo)

    // Generate filename YYYY-MM-DD
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const filename = `wealthsimple-activity-${yyyy}-${mm}-${dd}`;

    downloadCSV(result, filename);
  });


})()