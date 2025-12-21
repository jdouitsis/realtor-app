let getRowPrice = (row) => {
  let rawValue = row.querySelector(
    '.sc-c72b029c-0.bYQrcY'
  ).textContent
    .slice(0, -4)
    .replace('$', '')
    .replace(' ', '')
  let isNegative = rawValue.charCodeAt(0) == 8722
  let num;
  if (isNegative) {
    num = parseFloat(rawValue.slice(1)) * -1
  } else {
    num = parseFloat(rawValue)
  }

  return {
    amount: num
  }
}

let getMerchant = (row) => {
  let merchant = row.querySelector(
    '.sc-c72b029c-0.gTLTOA'
  ).textContent
  return merchant
}

let extractDateTime2 = (row) => {
  const dateBlock = [...row.querySelectorAll('.sc-9b4b78e7-0.KtAnS')]
    .find(el => el.querySelector('p')?.textContent.trim() === 'Date');

  if (!dateBlock) return null;

  const valueContainer = dateBlock.querySelector('.sc-9b4b78e7-0.hHzCYp');
  if (!valueContainer) return null;

  return [...valueContainer.querySelectorAll('p')]
    .map(p => p.textContent.replace(/\u00a0/g, ' ').trim())
    .join(' ');
}

function downloadJSON(data, filename = 'data.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


let getJsonData = async () => {
  let rows = Array.from(document.querySelectorAll('.sc-9b4b78e7-0.geYxEQ'))
  let results = []
  // Opens all of the rows
  for (let row of rows) {
    row.querySelector('button').click();
  }
  await new Promise((resolve) => {
    setTimeout(resolve, 100);
  })
  // Acts on all of the rows
  for (let row of rows) {
    let content = getRowPrice(row);
    let merchant = getMerchant(row);

    let date = extractDateTime2(row)


    results.push({
      ...content,
      merchant,
      date
    })
  }

  console.log(results)
  return results
}

// create new button

let addButton = async () => {
  console.log("Adding download button...")
  await new Promise((resolve) => {
    console.log("in the promise")
    setTimeout(() => {
      console.log("In the timeout")
      resolve()
    }, 2_000)
  })
  console.log("...Wait complete")

  let BUTTON_ID = 'wealthsimple-customizer-download-btn';
  let CONTAINER_SELECTOR = '.sc-9b4b78e7-0.eNxsrS';
  let BUTTON_CLASSES = 'sc-1dd313f8-0 clFURo sc-ecac9ab9-0 ga-drJI';

  let container = document.querySelector(CONTAINER_SELECTOR);
  if (!container) {
    throw new Error('Target container not found');
  }


  // check for existing button
  let button = document.getElementById(BUTTON_ID);

  if (button) {
    // remove button
    button.remove();
  }

  button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.textContent = ' Download';
  button.className = BUTTON_CLASSES;
  button.style.marginLeft = 'auto'
  button.style.marginRight = '20px'

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

  // insert as second child
  let secondChild = container.children[1] || null;
  container.insertBefore(button, secondChild);

  // attach fresh action listener

  button.addEventListener('click', async () => {
    let result = await getJsonData()

    // Generate filename YYYY-MM-DD
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const filename = `wealthsimple-activity-${yyyy}-${mm}-${dd}.json`;

    downloadJSON(result, filename);
  });
  console.log("...button added");

}
console.log("going to add")
addButton()
