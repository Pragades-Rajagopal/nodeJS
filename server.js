if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const axios = require('axios');
const nodeGeocoder = require('node-geocoder');


const PORT = 3000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

const app = express();


let geoCodeOption = { provider:'openstreetmap' };
let geoCoder = nodeGeocoder(geoCodeOption);

// View engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// Define body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));

app.get('/', (req, res, next) => {
    res.render('searchcity');
});

async function getWeather (req, res, next) {
    let id = req.body.id;
    console.log(id);
    
    if (id == null){
        res.redirect('/');
    } else{

        let lat, lng;

        await geoCoder.geocode(id).then((res)=>{
            console.log(res[0].latitude + ' ' + res[0].longitude);
            lat = res[0].latitude;
            lng = res[0].longitude;
        });

        const url = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=metric&exclude=minutely,hourly,daily,alerts&appid=${ WEATHER_API_KEY }`);
        console.log(url.data);

        const data = url.data.current;
        console.log(data.temp);

        res.render('info', { data, id });

    }
};

app.post('/city/info', getWeather);

app.listen(PORT, () => {
    console.log('Server started on port: '+PORT);
});