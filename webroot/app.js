import { React, ReactDOM } from "https://unpkg.com/es-react/dev";
import htm from "https://cdn.pika.dev/htm";

const html = htm.bind(React.createElement);
const BACKEND_URL = "/service";

const ServicePoller = () => {
  const [error, setError] = React.useState(null);
  const [services, setServices] = React.useState([
      { url: "kry.se" },
      { url: "google.se" },
      { url: "www.livi.co.uk" },
    ]);

  React.useEffect(() => {
    sendRequest('GET', null);
  }, []);

  const sendRequest = (method, service) => {
    console.info(method, service);
    let body = service ? JSON.stringify(service) : null;
    fetch(BACKEND_URL, {
      headers: {
       Accept: 'application/json',
       'Content-Type': 'application/json'
     },
      mode: 'cors',
      method,
      body,
    })
    .then((res) => checkResponse(res))
    .then((res) => (services = res))
    .catch(setError);  
  }

  const checkResponse = (res) => {
    if (!res.ok) {
      throw new Error(res.status + " BackEnd Error: " + res.statusText);
    }
    return res;
  }  

  const addUpdateService = (service) => {
    try {
      if (isValidService(service)) {
        if (isServiceAlreadyExist(service)) {
          sendRequest('POST', service);
        } else {
          sendRequest('PUT', service);
        }
      } 
    } catch (e) {
      setError(e);
    }
  }
  
  const deleteService = (service) => {
    sendRequest('DELETE', service);
  }

  const isValidService = (service) => {
    if (!service || !service.url.length > 0) {
      throw new Error('Please supply a valid URL to poll');
    }
    return service ? isValidUrl(service.url) : false;
  }
  
  const isValidUrl = (url) => {
    return parsed = new URL(url) ? parsed.protocol === "http:" || parsed.protocol === "https:" : false;
  }

  const isServiceAlreadyExist = (service) => {
    return services.filter((s)=> s.url == service.url).length > 0;
  }

  const editService = (service) => {
    document.getElementById('url-input').value = service.url;
  }

  const clearService = () => {
    document.getElementById('url-input').value="";
  }
  
  return html`
    <main>
      <h1 className='header'>KRY status poller</h1>
      ${error != null &&
        html`
          <div className='error'>${error.message}</div>
          <!-- @todo Remove this error after X secs or activety -->
        `}
        
      <br />
      <input id="url-name" placeholder='Service Name'/>
      <input id="url-input" placeholder='Service URL'/>
      <br/>
      <button onClick='${(e)=>addUpdateService({ url:e.target.value, name:this})}' className='btn update'>Save</button>
      <button onClick='${(e)=>clearService()}' className='btn delete'>Clear</button>
      <ul>
        ${services.map(
          (service) => html`
            <li key=${service.url} className='service'><h3>${service.url}</h3> 
            <button onClick='${()=>editService(service)}' className='btn update'>Edit</button>
            <button onClick='${()=>deleteService(service)}' className='btn delete'>Delete</button>
            </li>
          `
        )}
      </ul>
    </main>
  `;
};

ReactDOM.render(React.createElement(ServicePoller), document.getElementById('app'));
