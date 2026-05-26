import { useState } from 'react';
import './App.css';

function App() {

const MY_ID = "b896659d";
const MY_KEY = "04d69399aa421acbb3a44a5582890a15";

const [ingredients,setIngredients] = useState("");
const [nutrition,setNutrition] = useState(null);
const [loading,setLoading] = useState(false);
const [error,setError] = useState("");


const handleInput = (e) => {
  setIngredients(e.target.value);
}


const getNutrition = async(e) => {

  e.preventDefault();
  if(!ingredients.trim()){
    setError("Please enter ingredients");
    return;
  }

   const ingredientsArray = ingredients
  .split(",")
  .map(item => item.trim())
  .filter(item => item !== "");

  
  if(ingredientsArray.length === 1 && !ingredients.includes(",")){
    setError("Please separate ingredients with commas: 2 eggs, 1 tomato, 100g cheese");
    return;
  }

   try{

    setLoading(true);
    setError("");
    setNutrition(null);

  const response = await fetch(
      `https://api.edamam.com/api/nutrition-details?app_id=${MY_ID}&app_key=${MY_KEY}`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          title: "My Recipe",
          ingr: ingredientsArray,
          yield: 1,
      })
      }
  );
   
    if(response.status === 429 || response.status === 555){
  setError("API limit reached. Please try again later.");
  return;
}
    

const data = await response.json();

if(!response.ok){
  setError("Please enter ingredients in this format: 2 eggs, 1 tomato, 100g cheese");
  return;
}

const calories =
  data.ingredients?.reduce((sum, item) => {
    return (
      sum +
      (item.parsed?.[0]?.nutrients?.ENERC_KCAL?.quantity || 0)
    );
  }, 0);

  const nutrients = data.ingredients?.reduce(
  (acc, item) => {

    const n = item.parsed?.[0]?.nutrients;

    if (!n) return acc;

    acc.protein += n.PROCNT?.quantity || 0;
    acc.fat += n.FAT?.quantity || 0;
    acc.carbs += n.CHOCDF?.quantity || 0;
    acc.fiber += n.FIBTG?.quantity || 0;

    return acc;
  },
  {
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0
  }
);

    setNutrition({...data,calories, nutrients
    });

  }

  catch(error){
    console.log(error);
  }

  finally{
    setLoading(false);
  }

}


return(
    <div className="App">
      
      <div className="animated-bg"></div>

      <div className="content">
      <h1>Nutrition Analyzer</h1>

      <form onSubmit={getNutrition}>
        <input
          placeholder="2 eggs, 2 tomatoes, 1 avocado"
          value={ingredients}
          onChange={handleInput}/>
        <p className="hint">
          Separate ingredients with commas
        </p>

        <button>Analyze</button>
      </form>

      {error && (
        <div className="error-card">
          {error}
        </div>
      )}

     {loading && (
        <div>
          <div className="loader"></div>
            <p className="loading-text">Analyzing ingredients...</p>
        </div>
      )}

      {nutrition && (

    <div className="results-card">

      <h2>Nutrition Summary</h2>

      <p>🔥 Calories: {nutrition.calories?.toFixed(0)} calories</p>
      <p>🥩 Protein: {nutrition.nutrients?.protein?.toFixed(0) || 0} g</p>
      <p>🥑 Fat: {nutrition.nutrients?.fat?.toFixed(0) || 0} g</p>
      <p>🍞 Carbs: {nutrition.nutrients?.carbs?.toFixed(0) || 0} g</p>
      <p>🌿 Fiber: {nutrition.nutrients?.fiber?.toFixed(0) || 0} g</p>

    </div>
)}

</div>
</div>
);


}

export default App;