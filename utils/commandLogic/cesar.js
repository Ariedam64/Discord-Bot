function cesarEncode(text, shift) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const shiftedText = text.toLowerCase();
    let encodedText = '';
  
    for (let i = 0; i < shiftedText.length; i++) {
      const currentChar = shiftedText[i];
  
      if (alphabet.includes(currentChar)) {
        const currentIndex = alphabet.indexOf(currentChar);
        let newIndex = (currentIndex + shift) % 26;
        if (newIndex < 0) newIndex += 26;
        encodedText += alphabet[newIndex];
      } else {
        encodedText += currentChar;
      }
    }
  
    return encodedText;
  }

  function cesarDecode(text, shift) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const shiftedText = text.toLowerCase();
    let decodedText = '';
  
    for (let i = 0; i < shiftedText.length; i++) {
      const currentChar = shiftedText[i];
  
      if (alphabet.includes(currentChar)) {
        const currentIndex = alphabet.indexOf(currentChar);
        let newIndex = (currentIndex - shift + 26) % 26;
        decodedText += alphabet[newIndex];
      } else {
        decodedText += currentChar;
      }
    }
  
    return decodedText;
  }

  function cesarBruteforce(text) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const shiftedText = text.toLowerCase();
    let results = [];
  
    for (let shift = 1; shift < 26; shift++) {
      let decodedText = '';
  
      for (let i = 0; i < shiftedText.length; i++) {
        const currentChar = shiftedText[i];
  
        if (alphabet.includes(currentChar)) {
          const currentIndex = alphabet.indexOf(currentChar);
          let newIndex = (currentIndex - shift + 26) % 26; 
          decodedText += alphabet[newIndex];
        } else {
          decodedText += currentChar;
        }
      }
  
      results.push({
        shift: shift,
        decodedText: decodedText,
      });
    }
  
    return results;
  }
  
  module.exports = { cesarEncode, cesarDecode, cesarBruteforce };