import re
import json


COLUMN_A = {i: {} for i in range(1, 37, 2)}
COLUMN_B = {i: {} for i in range(1, 37, 2)}
COLUMN_C = {i: {} for i in range(2, 38, 2)}
COLUMN_D = {i: {} for i in range(2, 38, 2)}


def get_column(page, colpos):
    if page % 2 == 1:
        if colpos == 0:
            return COLUMN_A
        return COLUMN_B

    if colpos == 0:
        return COLUMN_C
    return COLUMN_D


with open("/Users/aiden/site/vocabtrainer/vocab.txt", "r") as f:
    vocab = re.sub(r"[0-9]", "", f.read()).split("\n")  # remove numbers
    page_no = 1

    for line in vocab:
        split_line = list(
            filter(None, line.split("   "))
        )  # two word-definitions, separated by column

        if len(split_line) <= 1:  # empty line
            continue

        if split_line[0] == "\x0c":  # page break
            page_no += 1
            split_line.pop(0)

        for i, c in enumerate(split_line):
            column = get_column(page_no, i)[page_no]

            # strip words and definitions
            pair = c.split(" – ")
            for i, s in enumerate(pair):
                pair[i] = s.strip()

            # the definition of the last word has 2 lines (confusing right)
            if len(pair) == 1:
                column[list(column.keys())[-1]] += ' ' + pair[0]

            else:  # key-value (word-definition)
                assert len(pair) == 2
                column[pair[0]] = pair[1]

    columns = {
        "A": COLUMN_A,
        "B": COLUMN_B,
        "C": COLUMN_C,
        "D": COLUMN_D,
    }


with open("/Users/aiden/site/vocabtrainer/vocab.json", "w") as f:
    json.dump(columns, f, indent=4)
