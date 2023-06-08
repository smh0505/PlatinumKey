export function parse(msg: string) {
    let text = msg, begin = 0, end = 0
    let rawTags = ''
    let rawSource = ''
    let rawParameters = ''

    // Parsing tags (optional)
    if (text[begin] === '@') {
        end = text.indexOf(' ')
        rawTags = text.slice(begin, end)
        begin = end + 1
    }

    // Parsing source (optional)
    if (text[begin] === ':') {
        begin += 1
        end = text.indexOf(' ', begin)
        rawSource = text.slice(begin, end)
        begin = end + 1
    }

    // Parsing Parameters
    end = text.indexOf(':', begin)
    if (end == -1) {
        end = text.length
    }

    if (end != text.length) {
        begin = end + 1
        rawParameters = text.slice(begin)
    }

    // Return
    return {
        name: getName(rawTags, rawSource),
        text: rawParameters.trim()
    }
}

function getName(rawTags: string, rawSource: string) {
    const parsedTags = rawTags.split(';').find(x => x.includes('display-name'))
    let username = rawSource.split('!')[0]

    if (parsedTags) {
        const displayname = parsedTags.split('=')[1]
        if (displayname !== '') {
            username = displayname
        }
    }

    return username
}