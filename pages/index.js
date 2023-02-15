import styles from '@/styles/Home.module.scss'
import { Inter } from '@next/font/google'
import Head from 'next/head'
import { use, useEffect, useState } from 'react'
import classnames from 'classnames'

const inter = Inter({ subsets: ['latin'] })

function Employee({
  email,
  imagePortraitUrl,
  imageWallOfLeetUrl,
  name,
  office,
  linkedIn,
  gitHub,
  twitter
}) {
  const hideImgWhenError = (e) => {
    e.target.onerror = null
    e.target.style.display = 'none'
  }

  return (
    <div className={styles.employee} tabIndex="0">
      <div className={styles.employeeImgHolder}>
        <img src={imagePortraitUrl || 'undefinedPortraitUrl'} width="100" alt={name} loading="lazy" onError={hideImgWhenError} />
      </div>
      <div className={styles.employeeInfo}>
        <div className={styles.employeeContacts}>
          <p>{name}</p>
          <p>Office: {office}</p>
        </div>

        <div className={styles.employeeLinks}>
          {linkedIn && <a href={`https://www.linkedin.com${linkedIn}`}><img src="https://cdn.iconscout.com/icon/free/png-256/linkedin-138-438236.png?f=avif&w=128" alt="LinkedIn" /></a>}
          {gitHub && <a href={`https://github.com/${gitHub}`} target="_blank"><img src="https://cdn.iconscout.com/icon/free/png-256/github-163-761603.png?f=webp&w=128" alt="GitHub" /></a>}
          {twitter && <a href={`https://twitter.com/${twitter}`} target="_blank"><img src="https://cdn.iconscout.com/icon/free/png-256/twitter-88-433359.png?f=webp&w=128" alt="Twitter" /></a>}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [employees, setEmployees] = useState(null)
  const [viewType, setViewType] = useState('grid')
  const [sorting, setSorting] = useState('nameAscending')
  const [searchQuery, setSearchQuery] = useState('')
  const [filtersByOffices, setFiltersByOffices] = useState(new Set())

  const availableOffices = [...new Set(employees?.map(({ office }) => office || 'Undefined office'))].sort()

  useEffect(() => {
    async function fetchEmployees() {
      const res = await fetch('api/employees')
      const json = await res.json()
      setEmployees(json)
    }

    fetchEmployees()
  }, [])

  useEffect(() => {
    console.log('filtersByOffices', filtersByOffices)
  }, [filtersByOffices])

  const toggleOfficeFilter = (office) => {
    filtersByOffices.has(office) ? filtersByOffices.delete(office) : filtersByOffices.add(office)
    setFiltersByOffices(prevValue => new Set([...prevValue, ...filtersByOffices]))
  }

  const employeeSorting = (a, b) => {
    switch (sorting) {
      case 'nameAscending':
        return a.name.localeCompare(b.name)
      case 'nameDescending':
        return -1 * a.name.localeCompare(b.name)
      case 'officeAscending':
        return String(a.office).localeCompare(String(b.office))
      case 'officeDescending':
        return -1 * String(a.office).localeCompare(String(b.office))
    }
  }

  return (
    <>
      <Head>
        <title>The fellowship of the tretton37</title>
        <meta name="description" content="The fellowship of the tretton37" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={classnames(styles.main, inter.className)}>
        <h1>The fellowship of the tretton37</h1>

        <div className={styles.tools}>
          <div className={styles.toolsSection}>
            <label>View:</label>
            <div>
              <label htmlFor="view-type-grid">Grid</label>
              <input type="radio" id="view-type-grid" name="view" value="grid" checked={viewType === 'grid'} onChange={({ target }) => setViewType(target.value)} />
            </div>
            <div>
              <label htmlFor="view-type-list">List</label>
              <input type="radio" id="view-type-list" name="view" value="list" checked={viewType === 'list'} onChange={({ target }) => setViewType(target.value)} />
            </div>
          </div>

          <div className={styles.toolsSection}>
            <label htmlFor='search'>Search:</label>
            <input placeholder="Search by name" id="search" type="text" value={searchQuery} onChange={({ target }) => setSearchQuery(target.value)}/>
          </div>

          <div className={styles.toolsSection}>
            <label>Filter by office:</label>  
            {availableOffices.map((office, index) => (
              <div key={office}>
                <label htmlFor={`office-${index}`}>
                  <input id={`office-${index}`} type="checkbox" value={office} className={classnames(styles.offices, { [styles.officesActive]: filtersByOffices.has(office) })} onClick={() => toggleOfficeFilter(office)} />
                  {office}
                </label>
              </div>
            ))}
          </div>

          <div className={styles.toolsSection}>
            <label htmlFor="sorting">Sort:</label>
            <select id="sorting" defaultValue={sorting} onChange={({ target }) => setSorting(target.value)}>
              <option value="nameAscending">Name (A-Ö)</option>
              <option value="nameDescending">Name (Ö-A)</option>
              <option value="officeAscending">Office (A-Ö)</option>
              <option value="officeDescending">Office (Ö-A)</option>
            </select>
          </div>
        </div>

        {employees && (
          <div className={viewType === 'list' ? styles.employeeList : styles.employeeGrid}>
            {employees
              // Filter by selected offices
              .filter(filtersByOffices.size ? (e) => (
                filtersByOffices.has(e.office || 'Undefined office')
              ) : Boolean)
              // Filter by name search
              .filter(searchQuery.trim().length ? (e) => {
                const searchRegExp = new RegExp(searchQuery.trim() + '.+$', 'i')
                return e.name.search(searchRegExp) != -1
              } : Boolean)
              .sort(employeeSorting)
              .map((employee) => (
                <Employee key={employee.email}  {...employee} />
              )
            )}
          </div>
        )}

      </main>
    </>
  )
}
