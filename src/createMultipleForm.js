const info = {
    // 出題数(1 - 最大問題数まで)
    questionNum: 10,
    // 出題範囲(SectionIDをカンマ区切りで)
    questionRange: [1, 2, 3],
    // 選択するsheetの名前
    sheetTitle: '選択するシート名',
    // 説明文
    description: '試験は80問/60分 \n 合格点は70%(56問) 以上です',
    // GoogleスプレッドシートのID
    fileId: 'xxxxxxxxxxxxxxxxxxx',
}

// 以下は編集しないでください

const utils_ = {
    getToday: d => [
        d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()]
        .map(v => v.toString())
        .map(v => v.padStart(2, '0')).join(''),

    shuffle: ([...clone]) => {
        const randInt = n => Math.trunc(Math.random() * n)
        const indexes = [...Array(clone.length - 1)]
            .map((_, i) => [i + 1, randInt(i + 1)])
        for (const [i, j] of indexes) {
            [clone[i], clone[j]] = [clone[j], clone[i]]
        }
        return clone
    }

}

const createForm_ = (title, description) => {
    const filename = `${title}.${utils_.getToday(new Date())}`
    const form = FormApp.create(filename)
    form.setTitle(title)
        .setDescription(description)
        .setPublishingSummary(true)
        .setAllowResponseEdits(true)
//        .canEditResponse(true)
        .setRequireLogin(true)
        .setCollectEmail(true)
        .setShuffleQuestions(true)
        .setIsQuiz(true)

    return form
}

const createQuestions_ = form => matrix => {
    const createMultipleChoice_ = form => (point, question, ...answers) => {
        const item = form.addMultipleChoiceItem()
            .setTitle(question).setPoints(point)
        const choises = utils_.shuffle(
            answers.map((v, i) => [v, i === 0])
        )
        item.setChoices(
            choises.map(v => item.createChoice(...v))
        )
    }

    const point = 100 / matrix.length
    for (const cols of matrix) {
        createMultipleChoice_(form)(point, ...cols)
    }
}

const main = () => {
    const { questionNum, questionRange, sheetTitle, description, fileId } = info
    const file = SpreadsheetApp.openById(fileId)
    const sheet = file.getSheetByName(sheetTitle)
    const matrix = sheet.getDataRange().getValues().slice(1)

    const form = createForm_(sheetTitle, description)
    const questions = utils_.shuffle(matrix
        .filter(cols => questionRange.includes(cols[0]))
        .map(v => v.slice(1))
    ).slice(0, questionNum)


    createQuestions_(form)(questions)
}
