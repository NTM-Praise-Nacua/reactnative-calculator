import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Pressable, FlatList } from "react-native";

export default function App() {
  const [display, setDisplay] = useState("");
  const [calHistory, setCalHistory] = useState([]);
  const [showFull, setShowFull] = useState(false);
  const flatListRef = useRef(null);

  const processData = (data) => {
    if (!isNaN(data)) {
      handleNumber(data);
    } else if (data === "C") {
      clear();
    } else if (data === "CS") {
      clearSingle();
    } else if (data === "=") {
      computeNumbers();
    } else {
      checkOperator(data);
    }
  };

  const computeNumbers = () => {
    if (display === "") return;

    try {
      const parts = display.split(" ");
      const a = Number(parts[0]);
      const op = parts[1];
      const b = Number(parts[2]);
      let result = 0;

      if (!isNaN(b) && b != 0) {
        switch (op) {
          case "+":
            result = a + b;
            break;
          case "-":
            result = a - b;
            break;
          case "*":
            result = a * b;
            break;
          case "/":
            result = a / b;
            break;
          case "%":
            result = a * 0.01 * b;
            break;
          default:
            result = 0;
            break;
        }
      } else {
        switch (op) {
          case "%":
            result = a * 0.01;
            break;
          default:
            result = a;
            break;
        }
      }
      setDisplay("= " + Number(result.toFixed(10)));
      setCalHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          equation: display,
          result: Number(result.toFixed(10)),
        },
      ]);
    } catch (error) {
      setDisplay("Error: ", error);
    }
  };

  const handleNumber = (num) => {
    if (display === "" && num === "0") return;

    setDisplay((prev) => {
      if (prev.includes("=")) {
        return num;
      } else {
        return prev + num;
      }
    });
  };

  const checkOperator = (data) => {
    const isOperator = ["+", "-", "*", "/", "%"];
    const displayParts = display.split(" ");

    if (
      (display === "" && data != "-") ||
      (display === "-" && isOperator.includes(data)) ||
      (display.length > 1 &&
        containsOperator(display) &&
        isOperator.includes(data)) ||
      (displayParts[0]?.includes(".") && data == "." && !displayParts[2]) ||
      (displayParts[2]?.includes(".") && data == ".")
    )
      return;

    setDisplay((prev) => {
      const parts = prev.split(" ");
      let newPrev = parts[0];
      if (parts.length > 1 && data != ".") newPrev = parts[1];

      const addSpace =
        (display === "" && data === "-") || data == "." ? "" : " ";

      return (data != "." ? newPrev : prev) + addSpace + data + addSpace;
    });
  };

  const clear = () => {
    setDisplay("");
  };

  const clearSingle = () => {
    const slicedInput =
      display.slice(-1) == " " ? display.slice(0, -2) : display.slice(0, -1);
    setDisplay(slicedInput);
  };

  const calcButton = (text, width = "25%") => {
    const operators = ["C", "CS", "%", "/", "*", "-", "+"];
    return (
      <View
        style={{
          width: width,
          justifyContent: "center",
          alignItems: "center",
          padding: 10,
        }}
      >
        <View
          style={{
            height: 60,
            width: "100%",
            borderRadius: 5,
            backgroundColor: text == "=" ? "#ff6700" : "lightgray",
            position: "relative",
          }}
        >
          <Pressable
            style={({ pressed }) => [
              styles.calcButton,
              pressed && styles.pressedCalcButton,
              {
                backgroundColor: text == "=" ? "orange" : "#f4f4f4",
              },
            ]}
            onPress={() => processData(text)}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color:
                  text == "="
                    ? "white"
                    : operators.includes(text)
                    ? "orange"
                    : "black",
              }}
            >
              {text}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const Item = ({ item, index, count, showFull }) => {
    let showAll =
      count == 1 && display !== "" && display.includes("=") ? false : true;
    if (count - 1 == index && count > 1) {
      showAll = showFull;
    }

    let showFinal = item.equation;

    if (showAll) {
      showFinal = showFinal + " = " + item.result;
    }

    return (
      <Text
        style={{
          textAlign: "right",
          fontSize: 20,
          color: "gray",
        }}
      >
        {showFinal}
      </Text>
    );
  };

  useEffect(() => {
    // console.log(
    //   "display:",
    //   display,
    //   "showFull?",
    //   display === "" ||
    //     display === "0" ||
    //     display === "-" ||
    //     !isNaN(Number(display)) ||
    //     containsOperator(display)
    // );
    if (
      display === "" ||
      display === "0" ||
      display === "-" ||
      !isNaN(Number(display)) ||
      containsOperator(display)
    ) {
      setShowFull(true);
    } else {
      setShowFull(false);
    }
  }, [display]);

  const containsOperator = (str) => {
    const operators = ["+", "-", "*", "/", "%"];
    const content = str.startsWith("-") ? str.slice(1) : str;

    return operators.some((op) => content.includes(op)) && !str.includes("=");
  };

  useEffect(() => {
    if (flatListRef.current && calHistory.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [calHistory]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.innerContainer}>
        <View style={styles.outputContainer}>
          <View style={styles.outputInnerContainer}>
            <FlatList
              ref={flatListRef}
              style={{
                flex: 1,
                borderWidth: 0,
              }}
              contentContainerStyle={styles.calHistoryContainer}
              data={calHistory}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <Item
                  item={item}
                  index={index}
                  count={calHistory.length}
                  showFull={showFull}
                />
              )}
            />
            <Text
              style={{
                textAlign: "right",
                fontSize: 42,
                fontWeight: "bold",
              }}
            >
              {display || "0"}
            </Text>
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          <View style={styles.buttonRowContainer}>
            {calcButton("C")}
            {calcButton("CS")}
            {calcButton("%")}
            {calcButton("/")}
          </View>
          <View style={styles.buttonRowContainer}>
            {calcButton("7")}
            {calcButton("8")}
            {calcButton("9")}
            {calcButton("*")}
          </View>
          <View style={styles.buttonRowContainer}>
            {calcButton("4")}
            {calcButton("5")}
            {calcButton("6")}
            {calcButton("-")}
          </View>
          <View style={styles.buttonRowContainer}>
            {calcButton("1")}
            {calcButton("2")}
            {calcButton("3")}
            {calcButton("+")}
          </View>
          <View style={styles.buttonRowContainer}>
            {calcButton("0")}
            {calcButton(".")}
            {calcButton("=", "50%")}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    padding: 40,
    paddingLeft: 20,
    paddingRight: 20,
  },
  innerContainer: {
    width: "100%",
    height: "100%",
  },
  outputContainer: {
    width: "100%",
    height: 300,
    padding: 10,
  },
  outputInnerContainer: {
    flex: 1,
    height: "100%",
    backgroundColor: "lightgray",
    padding: 10,
    borderRadius: 10,
  },
  calHistoryContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  buttonsContainer: {
    flex: 1,
  },
  buttonRowContainer: {
    flexDirection: "row",
  },
  calcButton: {
    borderRadius: 5,
    height: 60,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -4,
  },
  pressedCalcButton: {
    marginTop: 4,
    opacity: 0.65,
  },
});
