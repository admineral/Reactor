// In ./extractAnswerAndCode.js
export const extractAnswerAndCode = (apiResponse) => {
  // Extract answer and code parts from the API response
  let answerPart = "";
  let codePart = "";
  let isAnswer = true;

  for (const line of apiResponse.split("\n")) {
    try {
      const obj = JSON.parse(line.replace("data: ", ""));
      const content = obj?.choices[0]?.delta?.content;

      if (content.includes("{Answer End}")) {
        isAnswer = false;
      }

      if (isAnswer) {
        answerPart += content;
      } else {
        if (content.includes("{Code Start}")) {
          // Avoid adding the tag "{Code Start}" to the code
          codePart += content.replace("{Code Start}", "");
        } else {
          codePart += content;
        }
      }
    } catch (error) {
      console.error("Failed to parse line:", line);
    }
  }

  return {
    extractedAnswer: answerPart.trim(),
    code: codePart.trim(),
  };
};
