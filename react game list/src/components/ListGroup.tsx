import { useState } from "react";

interface Props{
  items:string[];
  heading:string;
}
function ListGroup({items, heading}: Props) {
  
  //use state is a hook, a function uses built in React features

  const [selectedIndex, setSelectedIndex] = useState(-1);

  //  items = [];
  // const getMessage = ()=>{
  //   return items.length === 0 ? <p>No item found</p> : null
  // this is one way to do things.}

  return (
    <>
      <h1>{heading}</h1>
      {/* {getMessage} */}
      {/* {items.length === 0 ? <p>No item found</p>: null} the code below is the same except a little more concise. null is no longer needed becasue of the &&*/}
      {items.length === 0 && <p>No item found</p>}
      <ul className="list-group">
        {items.map((item, index) => (
          <li
            className={
              selectedIndex === index
                ? "list-group-item active"
                : "list-group-item"
            }
            key={item}
            onClick={() => {
              setSelectedIndex(index);
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
