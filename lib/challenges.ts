// Practice challenges for JavaScript and Java

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  hint: string;
  starterCode: {
    javascript: string;
    java: string;
  };
}

export const challenges: Challenge[] = [
  {
    id: "hello-world",
    title: "Hello World",
    difficulty: "Easy",
    description:
      "The classic first program. Print \"Hello, World!\" to the console.",
    hint: "Use the print/log function for your chosen language.",
    starterCode: {
      javascript: `// Challenge: Hello World
// Print "Hello, World!" to the console

function helloWorld() {
  // Your code here
}

helloWorld();
`,
      java: `// Challenge: Hello World
// Print "Hello, World!" to the console

public class Main {
    public static void main(String[] args) {
        // Your code here
    }
}
`,
    },
  },
  {
    id: "fizzbuzz",
    title: "FizzBuzz",
    difficulty: "Easy",
    description:
      "Print numbers 1–30. For multiples of 3 print \"Fizz\", for multiples of 5 print \"Buzz\", and for multiples of both print \"FizzBuzz\".",
    hint: "Use the modulo (%) operator to check divisibility.",
    starterCode: {
      javascript: `// Challenge: FizzBuzz
// Print numbers 1-30 with FizzBuzz rules

function fizzBuzz() {
  for (let i = 1; i <= 30; i++) {
    // Your code here
  }
}

fizzBuzz();
`,
      java: `// Challenge: FizzBuzz
// Print numbers 1-30 with FizzBuzz rules

public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 30; i++) {
            // Your code here
        }
    }
}
`,
    },
  },
  {
    id: "reverse-string",
    title: "Reverse a String",
    difficulty: "Easy",
    description:
      "Write a function that takes a string and returns it reversed. Example: \"hello\" → \"olleh\".",
    hint: "Try iterating backwards, or use built-in methods like split/reverse/join.",
    starterCode: {
      javascript: `// Challenge: Reverse a String
// Return the reversed version of the input string

function reverseString(str) {
  // Your code here
}

console.log(reverseString("hello"));   // Expected: "olleh"
console.log(reverseString("CodeCollab")); // Expected: "baloCodeC"
`,
      java: `// Challenge: Reverse a String
// Return the reversed version of the input string

public class Main {
    public static String reverseString(String str) {
        // Your code here
        return "";
    }

    public static void main(String[] args) {
        System.out.println(reverseString("hello"));     // Expected: olleh
        System.out.println(reverseString("CodeCollab")); // Expected: baloCodeC
    }
}
`,
    },
  },
  {
    id: "palindrome",
    title: "Palindrome Check",
    difficulty: "Easy",
    description:
      "Write a function that returns true if a string is a palindrome (reads the same forwards and backwards), ignoring case. Example: \"racecar\" → true, \"hello\" → false.",
    hint: "Compare the string to its reverse, or use two pointers from both ends.",
    starterCode: {
      javascript: `// Challenge: Palindrome Check
// Return true if the string is a palindrome

function isPalindrome(str) {
  // Your code here
}

console.log(isPalindrome("racecar")); // true
console.log(isPalindrome("hello"));   // false
console.log(isPalindrome("Madam"));   // true (ignore case)
`,
      java: `// Challenge: Palindrome Check
// Return true if the string is a palindrome (ignore case)

public class Main {
    public static boolean isPalindrome(String str) {
        // Your code here
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("racecar")); // true
        System.out.println(isPalindrome("hello"));   // false
        System.out.println(isPalindrome("Madam"));   // true
    }
}
`,
    },
  },
  {
    id: "factorial",
    title: "Factorial",
    difficulty: "Medium",
    description:
      "Compute the factorial of a non-negative integer n. Factorial of 5 is 5 × 4 × 3 × 2 × 1 = 120. Handle n = 0 which returns 1.",
    hint: "Use recursion or a loop. Remember 0! = 1.",
    starterCode: {
      javascript: `// Challenge: Factorial
// Return n! (n factorial)

function factorial(n) {
  // Your code here
}

console.log(factorial(0)); // 1
console.log(factorial(5)); // 120
console.log(factorial(10)); // 3628800
`,
      java: `// Challenge: Factorial
// Return n! (n factorial)

public class Main {
    public static long factorial(int n) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(factorial(0));  // 1
        System.out.println(factorial(5));  // 120
        System.out.println(factorial(10)); // 3628800
    }
}
`,
    },
  },
  {
    id: "fibonacci",
    title: "Fibonacci Sequence",
    difficulty: "Medium",
    description:
      "Return the nth Fibonacci number. The sequence starts: 0, 1, 1, 2, 3, 5, 8, 13 ... fib(0)=0, fib(1)=1, fib(7)=13.",
    hint: "Can be solved with recursion, iteration, or dynamic programming. Try the iterative approach for efficiency.",
    starterCode: {
      javascript: `// Challenge: Fibonacci Sequence
// Return the nth Fibonacci number (0-indexed)

function fibonacci(n) {
  // Your code here
}

console.log(fibonacci(0));  // 0
console.log(fibonacci(1));  // 1
console.log(fibonacci(7));  // 13
console.log(fibonacci(10)); // 55
`,
      java: `// Challenge: Fibonacci Sequence
// Return the nth Fibonacci number (0-indexed)

public class Main {
    public static long fibonacci(int n) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(fibonacci(0));  // 0
        System.out.println(fibonacci(1));  // 1
        System.out.println(fibonacci(7));  // 13
        System.out.println(fibonacci(10)); // 55
    }
}
`,
    },
  },
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Medium",
    description:
      "Given an array of integers and a target, return the indices of the two numbers that add up to the target. Assume exactly one solution exists.",
    hint: "A brute-force nested loop works for small arrays. For O(n) efficiency, use a hash map to store visited numbers.",
    starterCode: {
      javascript: `// Challenge: Two Sum
// Return indices of two numbers that add up to target

function twoSum(nums, target) {
  // Your code here
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]
console.log(twoSum([3, 3], 6));          // [0, 1]
`,
      java: `// Challenge: Two Sum
// Return indices of two numbers that add up to target

import java.util.Arrays;
import java.util.HashMap;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9))); // [0, 1]
        System.out.println(Arrays.toString(twoSum(new int[]{3, 2, 4}, 6)));       // [1, 2]
        System.out.println(Arrays.toString(twoSum(new int[]{3, 3}, 6)));          // [0, 1]
    }
}
`,
    },
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Medium",
    description:
      "Implement binary search. Given a sorted array and a target, return the index of the target, or -1 if not found.",
    hint: "Track left and right pointers. Compare the middle element to the target and shrink the search space.",
    starterCode: {
      javascript: `// Challenge: Binary Search
// Return index of target in sorted array, or -1

function binarySearch(arr, target) {
  // Your code here
  return -1;
}

console.log(binarySearch([1, 3, 5, 7, 9, 11], 7));  // 3
console.log(binarySearch([1, 3, 5, 7, 9, 11], 6));  // -1
console.log(binarySearch([2, 4, 6, 8, 10], 2));      // 0
`,
      java: `// Challenge: Binary Search
// Return index of target in sorted array, or -1

public class Main {
    public static int binarySearch(int[] arr, int target) {
        // Your code here
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(binarySearch(new int[]{1, 3, 5, 7, 9, 11}, 7));  // 3
        System.out.println(binarySearch(new int[]{1, 3, 5, 7, 9, 11}, 6));  // -1
        System.out.println(binarySearch(new int[]{2, 4, 6, 8, 10}, 2));      // 0
    }
}
`,
    },
  },
  {
    id: "anagram",
    title: "Valid Anagram",
    difficulty: "Medium",
    description:
      "Given two strings s and t, return true if t is an anagram of s (same characters, same counts). Example: \"anagram\" and \"nagaram\" → true.",
    hint: "Sort both strings and compare, OR use a character frequency map.",
    starterCode: {
      javascript: `// Challenge: Valid Anagram
// Return true if t is an anagram of s

function isAnagram(s, t) {
  // Your code here
  return false;
}

console.log(isAnagram("anagram", "nagaram")); // true
console.log(isAnagram("rat", "car"));         // false
console.log(isAnagram("listen", "silent"));   // true
`,
      java: `// Challenge: Valid Anagram
// Return true if t is an anagram of s

import java.util.Arrays;

public class Main {
    public static boolean isAnagram(String s, String t) {
        // Your code here
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isAnagram("anagram", "nagaram")); // true
        System.out.println(isAnagram("rat", "car"));         // false
        System.out.println(isAnagram("listen", "silent"));   // true
    }
}
`,
    },
  },
  {
    id: "linked-list-reverse",
    title: "Reverse a Linked List",
    difficulty: "Hard",
    description:
      "Implement a singly linked list node and a function to reverse the list. Return the new head.",
    hint: "Use three pointers: prev, current, and next. Iterate and reverse the links one step at a time.",
    starterCode: {
      javascript: `// Challenge: Reverse a Linked List

class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  // Your code here
  return null;
}

// Helper to build and print list
function buildList(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);
  return head;
}
function printList(head) {
  const vals = [];
  while (head) { vals.push(head.val); head = head.next; }
  console.log(vals.join(" -> "));
}

const list = buildList([1, 2, 3, 4, 5]);
printList(reverseList(list)); // 5 -> 4 -> 3 -> 2 -> 1
`,
      java: `// Challenge: Reverse a Linked List

public class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static ListNode reverseList(ListNode head) {
        // Your code here
        return null;
    }

    // Helpers
    static ListNode buildList(int[] arr) {
        ListNode dummy = new ListNode(0), cur = dummy;
        for (int v : arr) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }
    static void printList(ListNode head) {
        StringBuilder sb = new StringBuilder();
        while (head != null) {
            sb.append(head.val);
            if (head.next != null) sb.append(" -> ");
            head = head.next;
        }
        System.out.println(sb);
    }

    public static void main(String[] args) {
        printList(reverseList(buildList(new int[]{1, 2, 3, 4, 5}))); // 5 -> 4 -> 3 -> 2 -> 1
    }
}
`,
    },
  },
];

// Default starter templates (blank slate)
export const defaultTemplates: Record<string, string> = {
  javascript: `// Welcome to CodeCollab — JavaScript Playground
// Start coding below and collaborate in real-time!

function main() {
  console.log("Hello, World!");
}

main();
`,
  java: `// Welcome to CodeCollab — Java Playground
// Start coding below and collaborate in real-time!

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`,
  python: `# Welcome to CodeCollab — Python Playground
# Start coding below and collaborate in real-time!

def main():
    print("Hello, World!")

main()
`,
  cpp: `// Welcome to CodeCollab — C++ Playground
// Start coding below and collaborate in real-time!

#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,
};
