import Alert from "./components/Alert";
import Button from "./components/Button";
import ListGroup from "./components/ListGroup";

function App() {
  let items = [
    "Final Fantasy",
    "Ghost of Tsushima",
    "DOOM",
    "DragonBall",
    "Spider-Man",
  ];
  return (
    <div>
      <ListGroup items={items} heading="Games" />
      {/* <Alert>Oh shit!</Alert> */}
      {/* <Button onClick={() => console.log("Clicked")}>
        More Info
      </Button> */}
    </div>
  );
}

export default App;
